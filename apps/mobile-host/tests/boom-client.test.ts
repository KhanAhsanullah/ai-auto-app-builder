import { describe, expect, it, vi } from 'vitest';

import {
  BoomLaunchClientError,
  fetchTenantConfigViaPlatformApi,
  launchBoomViaPlatformApi,
  resolvePlatformApiBaseUrl,
} from '../src/boom-client.js';

describe('boom-client (mobile-host)', () => {
  it('resolves default and override base URLs', () => {
    expect(resolvePlatformApiBaseUrl({})).toBe('http://127.0.0.1:8787');
    expect(
      resolvePlatformApiBaseUrl({ EXPO_PUBLIC_PLATFORM_API_URL: 'http://10.0.2.2:8787/' }),
    ).toBe('http://10.0.2.2:8787');
  });

  it('posts Boom launch and maps the provisioned tenant', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        {
          tenantId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          slug: 'careplus',
          name: 'CarePlus',
          vertical: 'pharmacy',
          status: 'active',
          created: true,
        },
        { status: 201 },
      ),
    );

    const result = await launchBoomViaPlatformApi(
      { businessName: 'CarePlus', vertical: 'pharmacy' },
      { baseUrl: 'http://127.0.0.1:8787', fetchImpl: fetchImpl as unknown as typeof fetch },
    );

    expect(result.slug).toBe('careplus');
    expect(result.vertical).toBe('pharmacy');
  });

  it('surfaces unreachable API errors', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('network');
    });

    await expect(
      launchBoomViaPlatformApi(
        { businessName: 'X', vertical: 'grocery' },
        { fetchImpl: fetchImpl as unknown as typeof fetch },
      ),
    ).rejects.toBeInstanceOf(BoomLaunchClientError);
  });

  it('fetches tenant config documents', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        {
          tenantId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          slug: 'careplus',
          status: 'active',
          updatedAt: '2026-09-13T00:00:00.000Z',
          configVersion: 1,
          document: { tenant: { name: 'CarePlus', vertical: 'pharmacy' } },
        },
        { status: 200 },
      ),
    );

    const result = await fetchTenantConfigViaPlatformApi('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result.configVersion).toBe(1);
    expect(result.document).toMatchObject({ tenant: { name: 'CarePlus' } });
  });
});
