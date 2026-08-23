import { createAuthClient } from '@ai-commerce/auth-client';
import { describe, expect, it } from 'vitest';

import {
  bearerPrincipal,
  createApiGateway,
  InMemoryCredentialValidator,
  InMemoryTenantConfigLoader,
  InMemoryTenantDirectory,
} from '../src/index.js';
import { loadFullTenantConfig, TENANT } from './helpers.js';

describe('createApiGateway facade', () => {
  function createGateway(options?: { requireAuth?: boolean }) {
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

    const validator = new InMemoryCredentialValidator();
    validator.seed({
      kind: 'bearer',
      credential: 'tok-me',
      tenantId: TENANT.id,
      principal: bearerPrincipal({
        subject: 'user-1',
        surface: 'customer',
        method: 'email',
        expiresAt: Date.now() + 60_000,
      }),
    });

    const gateway = createApiGateway({
      directory,
      configLoader,
      routes: [
        { method: 'GET', path: '/health', requireTenant: false, name: 'health' },
        { method: 'GET', path: '/v1/catalog', name: 'catalog' },
        {
          method: 'GET',
          path: '/v1/me',
          name: 'me',
          requireAuth: options?.requireAuth ?? true,
          authSurface: 'customer',
        },
        { method: 'POST', path: '/v1/echo', name: 'echo' },
      ],
      auth: {
        authClient: createAuthClient(),
        validator,
      },
      handler: async (context) => {
        if (context.request.path === '/v1/echo') {
          return {
            status: 200,
            body: {
              echo: context.request.body,
              query: context.request.query,
            },
          };
        }
        return {
          status: 200,
          body: {
            path: context.request.path,
            tenantId: context.tenant?.id,
            subject: context.auth?.subject,
            vertical: context.config?.vertical,
          },
        };
      },
    });

    return gateway;
  }

  it('handles framework-agnostic requests through the facade', async () => {
    const gateway = createGateway({ requireAuth: false });
    const response = await gateway.handle({
      method: 'GET',
      path: '/v1/catalog',
      headers: { 'x-tenant-id': TENANT.id },
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      tenantId: TENANT.id,
      vertical: 'grocery',
    });
  });

  it('exposes registered routes', () => {
    const gateway = createGateway();
    expect(gateway.routes.list()).toHaveLength(4);
  });

  it('listens on Node HTTP and serves health + authenticated routes', async () => {
    const gateway = createGateway();
    const listening = await gateway.listen(0);

    try {
      const health = await fetch(`http://127.0.0.1:${listening.port}/health`);
      expect(health.status).toBe(200);
      await expect(health.json()).resolves.toMatchObject({ path: '/health' });

      const unauthorized = await fetch(`http://127.0.0.1:${listening.port}/v1/me`, {
        headers: { 'x-tenant-id': TENANT.id },
      });
      expect(unauthorized.status).toBe(401);

      const me = await fetch(`http://127.0.0.1:${listening.port}/v1/me`, {
        headers: {
          'x-tenant-id': TENANT.id,
          authorization: 'Bearer tok-me',
        },
      });
      expect(me.status).toBe(200);
      await expect(me.json()).resolves.toMatchObject({
        subject: 'user-1',
        tenantId: TENANT.id,
      });
    } finally {
      await listening.close();
    }
  });

  it('parses JSON bodies and query strings over HTTP', async () => {
    const gateway = createGateway({ requireAuth: false });
    const listening = await gateway.listen(0);

    try {
      const response = await fetch(
        `http://127.0.0.1:${listening.port}/v1/echo?tag=demo&tag=extra`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': TENANT.id,
          },
          body: JSON.stringify({ hello: 'world' }),
        },
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        echo: { hello: 'world' },
        query: { tag: ['demo', 'extra'] },
      });
    } finally {
      await listening.close();
    }
  });
});
