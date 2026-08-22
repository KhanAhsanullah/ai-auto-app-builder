import { ConfigProvider } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import { ConfigInjector } from '../src/domain/config-injector.js';
import { createGatewayPipeline } from '../src/domain/create-gateway-pipeline.js';
import { InMemoryRateLimiter } from '../src/domain/rate-limiter.js';
import { RouteMatcher } from '../src/domain/route-matcher.js';
import { TenantResolver } from '../src/domain/tenant-resolver.js';
import { InMemoryTenantConfigLoader } from '../src/infrastructure/in-memory-tenant-config-loader.js';
import { InMemoryTenantDirectory } from '../src/infrastructure/in-memory-tenant-directory.js';
import { loadFullTenantConfig, TENANT } from './helpers.js';

describe('Gateway pipeline integration', () => {
  function createPipeline(options?: { rateLimit?: number }) {
    const directory = new InMemoryTenantDirectory();
    directory.seed([TENANT]);

    const configLoader = new InMemoryTenantConfigLoader();
    const tenantConfig = loadFullTenantConfig();
    configLoader.seed(TENANT.id, {
      ...tenantConfig,
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
        rateLimitPerWindow: options?.rateLimit,
      },
    ]);

    return createGatewayPipeline({
      routeMatcher,
      tenantResolver: new TenantResolver({ directory }),
      configInjector: new ConfigInjector({
        configProvider: new ConfigProvider({ cache: false }),
        configLoader,
      }),
      rateLimiter: new InMemoryRateLimiter(),
      defaultRateLimit: options?.rateLimit ?? 100,
      rateLimitWindowMs: 60_000,
      handler: async (context) => ({
        status: 200,
        body: {
          path: context.request.path,
          tenantId: context.tenant?.id,
          vertical: context.config?.vertical,
          params: context.route?.params,
        },
      }),
    });
  }

  it('serves public health without tenant', async () => {
    const pipeline = createPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/health',
      headers: {},
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ path: '/health', tenantId: undefined });
  });

  it('resolves tenant, injects config, and handles catalog', async () => {
    const pipeline = createPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/v1/catalog',
      headers: { 'x-tenant-id': TENANT.id },
      clientIp: '127.0.0.1',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      tenantId: TENANT.id,
      vertical: 'grocery',
    });
  });

  it('returns 400 when tenant is missing on protected routes', async () => {
    const pipeline = createPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/v1/catalog',
      headers: {},
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'tenant_resolution_failed' });
  });

  it('returns 404 for unknown routes', async () => {
    const pipeline = createPipeline();
    const response = await pipeline({
      method: 'GET',
      path: '/missing',
      headers: {},
    });

    expect(response.status).toBe(404);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    const pipeline = createPipeline({ rateLimit: 1 });

    const first = await pipeline({
      method: 'GET',
      path: '/v1/catalog',
      headers: { 'x-tenant-id': TENANT.id },
      clientIp: '1.1.1.1',
    });
    expect(first.status).toBe(200);

    const second = await pipeline({
      method: 'GET',
      path: '/v1/catalog',
      headers: { 'x-tenant-id': TENANT.id },
      clientIp: '1.1.1.1',
    });
    expect(second.status).toBe(429);
    expect(second.headers?.['retry-after']).toBeTruthy();
  });
});
