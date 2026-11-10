import { describe, expect, it } from 'vitest';

import { seedCatalogFromPlatformProducts } from '../src/seed-catalog-from-platform.js';

describe('seedCatalogFromPlatformProducts', () => {
  it('loads platform products into the catalog module', async () => {
    const catalog = await seedCatalogFromPlatformProducts({
      tenantId: 'tenant-1',
      now: () => '2026-11-01T00:00:00.000Z',
      products: [
        {
          id: 'tenant-1:oil',
          slug: 'oil',
          name: 'Olive Oil',
          sku: 'OIL-1',
          title: '1L',
          amount: 1800,
          currency: 'PKR',
          imageUrl: 'https://example.com/oil.jpg',
        },
      ],
    });

    const products = await catalog.listProducts('tenant-1');
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 'tenant-1:oil',
      slug: 'oil',
      name: 'Olive Oil',
      status: 'active',
    });
    expect(products[0]?.variants[0]).toMatchObject({
      sku: 'OIL-1',
      title: '1L',
      price: { amount: 1800, currency: 'PKR' },
    });
  });
});
