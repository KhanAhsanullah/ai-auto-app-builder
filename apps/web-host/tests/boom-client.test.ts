import { describe, expect, it, vi } from 'vitest';

import {
  BoomLaunchClientError,
  fetchTenantConfigViaPlatformApi,
  launchBoomViaPlatformApi,
  resolvePlatformApiBaseUrl,
} from '../src/boom-client.js';

describe('boom-client (web-host)', () => {
  it('resolves default and override base URLs', () => {
    expect(resolvePlatformApiBaseUrl({})).toBe('http://127.0.0.1:8787');
    expect(resolvePlatformApiBaseUrl({ VITE_PLATFORM_API_URL: 'http://localhost:9000/' })).toBe(
      'http://localhost:9000',
    );
  });

  it('posts Boom launch and maps the provisioned tenant', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        {
          tenantId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          slug: 'spice-route',
          name: 'Spice Route',
          vertical: 'restaurant',
          status: 'active',
          created: true,
        },
        { status: 201 },
      ),
    );

    const result = await launchBoomViaPlatformApi(
      { businessName: 'Spice Route', vertical: 'restaurant' },
      { baseUrl: 'http://127.0.0.1:8787', fetchImpl: fetchImpl as unknown as typeof fetch },
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:8787/v1/boom/launch',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toMatchObject({
      tenantId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      slug: 'spice-route',
      vertical: 'restaurant',
    });
  });

  it('surfaces API errors', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ error: 'businessName is required.' }, { status: 400 }),
    );

    await expect(
      launchBoomViaPlatformApi(
        { businessName: 'X', vertical: 'grocery' },
        { fetchImpl: fetchImpl as unknown as typeof fetch },
      ),
    ).rejects.toThrow(BoomLaunchClientError);
  });

  it('fetches tenant config documents', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        {
          tenantId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          slug: 'spice-route',
          status: 'active',
          updatedAt: '2026-09-13T00:00:00.000Z',
          configVersion: 1,
          publishId: 'pub-1',
          document: {
            tenant: { name: 'Spice Route', vertical: 'restaurant' },
            meta: { configVersion: 1 },
          },
        },
        { status: 200 },
      ),
    );

    const result = await fetchTenantConfigViaPlatformApi('dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      baseUrl: 'http://127.0.0.1:8787',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:8787/v1/tenants/dddddddd-dddd-4ddd-8ddd-dddddddddddd/config',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toMatchObject({
      configVersion: 1,
      document: { tenant: { name: 'Spice Route' } },
    });
  });

  it('surfaces config fetch errors', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ error: 'Tenant not found.' }, { status: 404 }),
    );

    await expect(
      fetchTenantConfigViaPlatformApi('missing', {
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(BoomLaunchClientError);
  });
});
