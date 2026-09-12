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

  it('lists tenants and returns config documents', async () => {
    const api = createPlatformApi({
      clock: () => '2026-09-12T00:00:00.000Z',
    });

    const empty = await api.listTenants();
    expect(empty.tenants).toEqual([]);

    const launched = await api.launchBoom({
      businessName: 'Byte Hub',
      vertical: 'electronics',
      tenantId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    });

    const listed = await api.listTenants();
    expect(listed.tenants).toHaveLength(1);
    expect(listed.tenants[0]).toMatchObject({
      tenantId: launched.tenantId,
      slug: 'byte-hub',
      vertical: 'electronics',
      name: 'Byte Hub',
    });

    const config = await api.getTenantConfig(launched.tenantId);
    expect(config).toMatchObject({
      tenantId: launched.tenantId,
      slug: 'byte-hub',
      status: 'active',
    });
    expect(config.document).toMatchObject({
      tenant: { name: 'Byte Hub', vertical: 'electronics' },
    });
  });
});
