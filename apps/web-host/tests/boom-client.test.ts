import { describe, expect, it, vi } from 'vitest';

import {
  BoomLaunchClientError,
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
});
