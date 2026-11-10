import { describe, expect, it, vi } from 'vitest';

import {
  createCatalogProductViaPlatformApi,
  deleteCatalogProductViaPlatformApi,
  fetchTenantCatalogViaPlatformApi,
  listTenantsViaPlatformApi,
  patchCatalogProductViaPlatformApi,
  PlatformClientError,
} from '../src/platform-client.js';

describe('platform-client', () => {
  it('lists tenants from platform-api', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        tenants: [
          {
            tenantId: 't1',
            slug: 'spice-route',
            status: 'active',
            vertical: 'restaurant',
            name: 'Spice Route',
          },
        ],
      }),
    );

    const tenants = await listTenantsViaPlatformApi({
      baseUrl: 'http://127.0.0.1:8787',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(tenants).toEqual([
      {
        tenantId: 't1',
        slug: 'spice-route',
        status: 'active',
        vertical: 'restaurant',
        name: 'Spice Route',
      },
    ]);
  });

  it('fetches catalog products', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        tenantId: 't1',
        vertical: 'grocery',
        updatedAt: '2026-11-01T00:00:00.000Z',
        products: [
          {
            id: 't1:oil',
            slug: 'oil',
            name: 'Oil',
            sku: 'OIL-1',
            title: '1L',
            amount: 10,
            currency: 'PKR',
            imageUrl: 'https://example.com/oil.jpg',
          },
        ],
      }),
    );

    const catalog = await fetchTenantCatalogViaPlatformApi('t1', {
      baseUrl: 'http://127.0.0.1:8787',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(catalog.products).toHaveLength(1);
    expect(catalog.products[0]?.slug).toBe('oil');
  });

  it('surfaces unreachable platform-api errors', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('network');
    });

    await expect(
      listTenantsViaPlatformApi({
        baseUrl: 'http://127.0.0.1:8787',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toBeInstanceOf(PlatformClientError);
  });

  it('creates, patches, and deletes catalog products', async () => {
    const product = {
      id: 't1:oil',
      slug: 'oil',
      name: 'Oil',
      sku: 'OIL-1',
      title: '1L',
      amount: 10,
      currency: 'PKR',
      imageUrl: 'https://example.com/oil.jpg',
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ product }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ product: { ...product, amount: 12 } }))
      .mockResolvedValueOnce(Response.json({ deleted: true }));

    const created = await createCatalogProductViaPlatformApi(
      't1',
      { name: 'Oil', sku: 'OIL-1', title: '1L', amount: 10 },
      { baseUrl: 'http://127.0.0.1:8787', fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(created.slug).toBe('oil');

    const patched = await patchCatalogProductViaPlatformApi(
      't1',
      'oil',
      { amount: 12 },
      { baseUrl: 'http://127.0.0.1:8787', fetchImpl: fetchImpl as unknown as typeof fetch },
    );
    expect(patched.amount).toBe(12);

    await deleteCatalogProductViaPlatformApi('t1', 'oil', {
      baseUrl: 'http://127.0.0.1:8787',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});
