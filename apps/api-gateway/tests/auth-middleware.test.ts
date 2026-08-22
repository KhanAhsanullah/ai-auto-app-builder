import { createAuthClient } from '@ai-commerce/auth-client';
import { ConfigProvider } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import { ConfigInjector } from '../src/domain/config-injector.js';
import { createGatewayPipeline } from '../src/domain/create-gateway-pipeline.js';
import { InMemoryRateLimiter } from '../src/domain/rate-limiter.js';
import { RouteMatcher } from '../src/domain/route-matcher.js';
import { TenantResolver } from '../src/domain/tenant-resolver.js';
import {
  bearerPrincipal,
  InMemoryCredentialValidator,
} from '../src/infrastructure/in-memory-credential-validator.js';
import { InMemoryTenantConfigLoader } from '../src/infrastructure/in-memory-tenant-config-loader.js';
import { InMemoryTenantDirectory } from '../src/infrastructure/in-memory-tenant-directory.js';
import { loadFullTenantConfig, TENANT } from './helpers.js';

describe('Auth middleware (Sprint 7 Task 2)', () => {
  function createAuthPipeline(options?: { now?: () => number; enableApi?: boolean }) {
    const directory = new InMemoryTenantDirectory();
    directory.seed([TENANT]);

    const configLoader = new InMemoryTenantConfigLoader();
    const tenantConfig = loadFullTenantConfig();
    const authentication = {
      ...tenantConfig.authentication,
      ...(options?.enableApi
        ? {
            api: {
              enabled: true,
              keyRotationDays: 90,
              oauthClientCredentials: false,
            },
          }
        : {}),
    };

    configLoader.seed(TENANT.id, {
      ...tenantConfig,
      authentication,
      tenant: {
        ...tenantConfig.tenant,
        id: TENANT.id,
        slug: TENANT.slug,
      },
    });

    const routeMatcher = new RouteMatcher();
    routeMatcher.registerAll([
      { method: 'GET', path: '/health', requireTenant: false, name: 'health' },
      {
        method: 'GET',
        path: '/v1/catalog',
        name: 'catalog',
        requireAuth: false,
      },
      {
        method: 'GET',
        path: '/v1/me',
        name: 'me',
        requireAuth: true,
        authSurface: 'customer',
      },
      {
        method: 'GET',
        path: '/v1/admin/orders',
        name: 'admin-orders',
        requireAuth: true,
        authSurface: 'admin',
      },
      {
        method: 'GET',
        path: '/v1/integrations',
        name: 'integrations',
        requireAuth: true,
        authSurface: 'api',
      },
    ]);

    const validator = new InMemoryCredentialValidator();
    const authClient = createAuthClient();

    const pipeline = createGatewayPipeline({
      routeMatcher,
      tenantResolver: new TenantResolver({ directory }),
      configInjector: new ConfigInjector({
        configProvider: new ConfigProvider({ cache: false }),
        configLoader,
      }),
      rateLimiter: new InMemoryRateLimiter(),
      auth: {
        authClient,
        validator,
        now: options?.now,
      },
      handler: async (context) => ({
        status: 200,
        body: {
          path: context.request.path,
          tenantId: context.tenant?.id,
          subject: context.auth?.subject,
          method: context.auth?.method,
          tokenType: context.auth?.tokenType,
        },
      }),
    });

    return { pipeline, validator };
  }

  it('allows unauthenticated access when requireAuth is false', async () => {
    const { pipeline } = createAuthPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/v1/catalog',
      headers: { 'x-tenant-id': TENANT.id },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ subject: undefined });
  });

  it('returns 401 when credentials are missing on requireAuth routes', async () => {
    const { pipeline } = createAuthPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/v1/me',
      headers: { 'x-tenant-id': TENANT.id },
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'unauthorized' });
    expect(response.headers?.['www-authenticate']).toBe('Bearer');
  });

  it('attaches principal for valid Bearer token', async () => {
    const { pipeline, validator } = createAuthPipeline();
    validator.seed({
      kind: 'bearer',
      credential: 'access-customer',
      tenantId: TENANT.id,
      principal: bearerPrincipal({
        subject: 'user-1',
        surface: 'customer',
        method: 'email',
        expiresAt: Date.now() + 60_000,
      }),
    });

    const response = await pipeline({
      method: 'GET',
      path: '/v1/me',
      headers: {
        'x-tenant-id': TENANT.id,
        authorization: 'Bearer access-customer',
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      subject: 'user-1',
      method: 'email',
      tokenType: 'bearer',
    });
  });

  it('accepts session cookie credentials', async () => {
    const { pipeline, validator } = createAuthPipeline();
    validator.seed({
      kind: 'session',
      credential: 'sess-admin',
      tenantId: TENANT.id,
      principal: {
        subject: 'admin-1',
        surface: 'admin',
        method: 'email',
        tokenType: 'session',
        expiresAt: Date.now() + 60_000,
        roles: ['admin'],
      },
    });

    const response = await pipeline({
      method: 'GET',
      path: '/v1/admin/orders',
      headers: {
        'x-tenant-id': TENANT.id,
        cookie: 'cos_session=sess-admin',
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      subject: 'admin-1',
      method: 'email',
      tokenType: 'session',
    });
  });

  it('rejects expired credentials', async () => {
    const fixedNow = 1_700_000_000_000;
    const { pipeline, validator } = createAuthPipeline({ now: () => fixedNow });
    validator.seed({
      kind: 'bearer',
      credential: 'stale',
      tenantId: TENANT.id,
      principal: bearerPrincipal({
        subject: 'user-1',
        surface: 'customer',
        method: 'google',
        expiresAt: fixedNow - 1,
      }),
    });

    const response = await pipeline({
      method: 'GET',
      path: '/v1/me',
      headers: {
        'x-tenant-id': TENANT.id,
        authorization: 'Bearer stale',
      },
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'unauthorized' });
  });

  it('rejects invalid Bearer tokens', async () => {
    const { pipeline } = createAuthPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/v1/me',
      headers: {
        'x-tenant-id': TENANT.id,
        authorization: 'Bearer unknown',
      },
    });

    expect(response.status).toBe(401);
  });

  it('rejects surface mismatch between credential and route', async () => {
    const { pipeline, validator } = createAuthPipeline();
    validator.seed({
      kind: 'bearer',
      credential: 'admin-tok',
      tenantId: TENANT.id,
      principal: bearerPrincipal({
        subject: 'admin-1',
        surface: 'admin',
        method: 'email',
        expiresAt: Date.now() + 60_000,
      }),
    });

    const response = await pipeline({
      method: 'GET',
      path: '/v1/me',
      headers: {
        'x-tenant-id': TENANT.id,
        authorization: 'Bearer admin-tok',
      },
    });

    expect(response.status).toBe(401);
  });

  it('accepts API key when api auth is enabled', async () => {
    const { pipeline, validator } = createAuthPipeline({ enableApi: true });
    validator.seed({
      kind: 'api_key',
      credential: 'pk_live_demo',
      tenantId: TENANT.id,
      principal: {
        subject: 'svc-integrations',
        surface: 'api',
        method: 'api_key',
        tokenType: 'api_key',
      },
    });

    const response = await pipeline({
      method: 'GET',
      path: '/v1/integrations',
      headers: {
        'x-tenant-id': TENANT.id,
        'x-api-key': 'pk_live_demo',
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      subject: 'svc-integrations',
      method: 'api_key',
      tokenType: 'api_key',
    });
  });

  it('rejects API key when api auth is disabled', async () => {
    const { pipeline, validator } = createAuthPipeline({ enableApi: false });
    validator.seed({
      kind: 'api_key',
      credential: 'pk_live_demo',
      tenantId: TENANT.id,
      principal: {
        subject: 'svc-integrations',
        surface: 'api',
        method: 'api_key',
        tokenType: 'api_key',
      },
    });

    const response = await pipeline({
      method: 'GET',
      path: '/v1/integrations',
      headers: {
        'x-tenant-id': TENANT.id,
        'x-api-key': 'pk_live_demo',
      },
    });

    expect(response.status).toBe(401);
  });
});
