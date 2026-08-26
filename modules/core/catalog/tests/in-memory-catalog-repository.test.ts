import { describe, expect, it } from 'vitest';

import { InMemoryCatalogRepository } from '../src/infrastructure/in-memory-catalog-repository.js';
import type { Category, Product } from '../src/types.js';

const category: Category = {
  tenantId: 'tenant-a',
  id: 'cat-1',
  slug: 'fruit',
  name: 'Fruit',
  sortOrder: 0,
  createdAt: '2026-08-27T02:00:00.000Z',
  updatedAt: '2026-08-27T02:00:00.000Z',
};

const product: Product = {
  tenantId: 'tenant-a',
  id: 'prod-1',
  slug: 'apple',
  name: 'Apple',
  status: 'draft',
  categoryIds: ['cat-1'],
  variants: [
    {
      id: 'var-1',
      sku: 'APL-1',
      title: 'Default',
      price: { amount: 1, currency: 'USD' },
    },
  ],
  createdAt: '2026-08-27T02:00:00.000Z',
  updatedAt: '2026-08-27T02:00:00.000Z',
};

describe('InMemoryCatalogRepository', () => {
  it('isolates tenants and looks up by sku', async () => {
    const repo = new InMemoryCatalogRepository();
    await repo.saveCategory(category);
    await repo.saveProduct(product);
    await repo.saveProduct({
      ...product,
      tenantId: 'tenant-b',
      id: 'prod-2',
      slug: 'apple',
      variants: [
        {
          id: 'var-2',
          sku: 'APL-1',
          title: 'Default',
          price: { amount: 1, currency: 'USD' },
        },
      ],
    });

    await expect(repo.listProductsByTenant('tenant-a')).resolves.toHaveLength(1);
    await expect(repo.findProductBySku('tenant-a', 'APL-1')).resolves.toMatchObject({
      id: 'prod-1',
    });
    await expect(repo.findProductBySku('tenant-a', 'APL-1', 'prod-1')).resolves.toBeUndefined();
  });
});
