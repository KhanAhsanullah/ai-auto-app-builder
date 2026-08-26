import { describe, expect, it } from 'vitest';

import { ProductNotFoundException } from '../src/errors.js';
import { createCatalogModule } from '../src/infrastructure/create-catalog-module.js';

describe('CatalogModule / createCatalogModule', () => {
  it('wires CRUD and storefront queries end-to-end', async () => {
    let n = 0;
    const catalog = createCatalogModule({
      now: () => '2026-08-27T04:00:00.000Z',
      createId: () => `id-${++n}`,
    });

    const category = await catalog.createCategory({
      tenantId: 'tenant-fresh',
      slug: 'fruit',
      name: 'Fruit',
      id: 'cat-fruit',
    });

    await catalog.createProduct({
      tenantId: 'tenant-fresh',
      slug: 'organic-apple',
      name: 'Organic Apple',
      status: 'active',
      categoryIds: [category.id],
      variants: [{ sku: 'APL-1', title: 'Default', price: { amount: 2.5, currency: 'USD' } }],
      id: 'prod-apple',
    });

    await catalog.createProduct({
      tenantId: 'tenant-fresh',
      slug: 'draft-pear',
      name: 'Draft Pear',
      status: 'draft',
      categoryIds: [category.id],
      variants: [{ sku: 'PEAR-1', title: 'Default', price: { amount: 1.5, currency: 'USD' } }],
    });

    await expect(catalog.listActiveProducts('tenant-fresh')).resolves.toMatchObject([
      { id: 'prod-apple', status: 'active' },
    ]);

    await expect(
      catalog.listProductsByCategory('tenant-fresh', 'cat-fruit', { activeOnly: true }),
    ).resolves.toHaveLength(1);

    await expect(
      catalog.searchProducts('tenant-fresh', 'apple', { activeOnly: true }),
    ).resolves.toMatchObject([{ id: 'prod-apple' }]);

    await expect(catalog.getProductBySlug('tenant-fresh', 'organic-apple')).resolves.toMatchObject({
      id: 'prod-apple',
    });

    await expect(catalog.getCategoryBySlug('tenant-fresh', 'fruit')).resolves.toMatchObject({
      id: 'cat-fruit',
    });
  });

  it('getProduct throws when missing', async () => {
    const catalog = createCatalogModule();
    await expect(catalog.getProduct('tenant-fresh', 'missing')).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
