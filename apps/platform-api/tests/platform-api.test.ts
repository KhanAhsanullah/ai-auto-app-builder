import { describe, expect, it } from 'vitest';

import { createPlatformApi } from '../src/infrastructure/create-platform-api.js';
import { TenantNotFoundException } from '../src/errors.js';

describe('PlatformApi', () => {
  it('provisions and activates a Boom launch', async () => {
    const api = createPlatformApi({
      clock: () => '2026-09-09T00:00:00.000Z',
    });

    const result = await api.launchBoom({
      businessName: 'Fresh Daily',
      vertical: 'grocery',
      tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });

    expect(result.created).toBe(true);
    expect(result.status).toBe('active');
    expect(result.slug).toBe('fresh-daily');
    expect(result.vertical).toBe('grocery');

    const tenant = await api.getTenant(result.tenantId);
    expect(tenant.status).toBe('active');
    expect(tenant.name).toBe('Fresh Daily');
  });

  it('throws when tenant is missing', async () => {
    const api = createPlatformApi();
    await expect(api.getTenant('missing-tenant')).rejects.toThrow(TenantNotFoundException);
  });
});
