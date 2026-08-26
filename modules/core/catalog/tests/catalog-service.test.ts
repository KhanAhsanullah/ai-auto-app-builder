import { describe, expect, it } from 'vitest';

import { CatalogService } from '../src/domain/catalog-service.js';
import {
  CatalogSkuConflictException,
  CatalogSlugConflictException,
  CatalogValidationException,
  CategoryNotFoundException,
  ProductNotFoundException,
} from '../src/errors.js';
import { InMemoryCatalogRepository } from '../src/infrastructure/in-memory-catalog-repository.js';

function createService(createIdSeq?: { n: number }) {
  const repository = new InMemoryCatalogRepository();
  let n = createIdSeq?.n ?? 0;
  const service = new CatalogService({
    repository,
    now: () => '2026-08-27T02:00:00.000Z',
    createId: () => `id-${++n}`,
  });
  return { service, repository };
}

describe('CatalogService', () => {
  it('creates and lists categories sorted by sortOrder', async () => {
    const { service } = createService();

    await service.createCategory({
      tenantId: 'tenant-a',
      slug: 'fruit',
      name: 'Fruit',
      sortOrder: 2,
      id: 'cat-fruit',
    });
    await service.createCategory({
      tenantId: 'tenant-a',
      slug: 'dairy',
      name: 'Dairy',
      sortOrder: 1,
      id: 'cat-dairy',
    });

    const list = await service.listCategories('tenant-a');
    expect(list.map((c) => c.slug)).toEqual(['dairy', 'fruit']);
  });

  it('rejects duplicate category slugs per tenant', async () => {
    const { service } = createService();
    await service.createCategory({
      tenantId: 'tenant-a',
      slug: 'fruit',
      name: 'Fruit',
    });

    await expect(
      service.createCategory({
        tenantId: 'tenant-a',
        slug: 'fruit',
        name: 'Fruit 2',
      }),
    ).rejects.toThrow(CatalogSlugConflictException);

    await expect(
      service.createCategory({
        tenantId: 'tenant-b',
        slug: 'fruit',
        name: 'Fruit',
      }),
    ).resolves.toMatchObject({ tenantId: 'tenant-b', slug: 'fruit' });
  });

  it('creates a product with variants and resolves by slug', async () => {
    const { service } = createService();
    await service.createCategory({
      tenantId: 'tenant-a',
      slug: 'fruit',
      name: 'Fruit',
      id: 'cat-fruit',
    });

    const product = await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'organic-apple',
      name: 'Organic Apple',
      categoryIds: ['cat-fruit'],
      status: 'active',
      variants: [
        {
          sku: 'APL-1',
          title: 'Default',
          price: { amount: 2.5, currency: 'USD' },
        },
      ],
      id: 'prod-apple',
    });

    expect(product).toMatchObject({
      id: 'prod-apple',
      status: 'active',
      categoryIds: ['cat-fruit'],
      variants: [{ sku: 'APL-1', price: { amount: 2.5, currency: 'USD' } }],
    });

    await expect(service.getProductBySlug('tenant-a', 'organic-apple')).resolves.toMatchObject({
      id: 'prod-apple',
    });
  });

  it('rejects products without variants or with unknown categories', async () => {
    const { service } = createService();

    await expect(
      service.createProduct({
        tenantId: 'tenant-a',
        slug: 'empty',
        name: 'Empty',
        variants: [],
      }),
    ).rejects.toThrow(CatalogValidationException);

    await expect(
      service.createProduct({
        tenantId: 'tenant-a',
        slug: 'x',
        name: 'X',
        categoryIds: ['missing'],
        variants: [{ sku: 'X-1', title: 'Default', price: { amount: 1, currency: 'USD' } }],
      }),
    ).rejects.toThrow(CategoryNotFoundException);
  });

  it('rejects duplicate SKUs across products in the same tenant', async () => {
    const { service } = createService();
    await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'a',
      name: 'A',
      variants: [{ sku: 'SKU-1', title: 'Default', price: { amount: 1, currency: 'USD' } }],
    });

    await expect(
      service.createProduct({
        tenantId: 'tenant-a',
        slug: 'b',
        name: 'B',
        variants: [{ sku: 'SKU-1', title: 'Default', price: { amount: 2, currency: 'USD' } }],
      }),
    ).rejects.toThrow(CatalogSkuConflictException);
  });

  it('updates product status and clears optional fields', async () => {
    const { service } = createService();
    await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'tea',
      name: 'Tea',
      description: 'Hot drink',
      mediaIds: ['m1'],
      variants: [{ sku: 'TEA-1', title: 'Default', price: { amount: 4, currency: 'USD' } }],
      id: 'prod-tea',
    });

    const updated = await service.updateProduct({
      tenantId: 'tenant-a',
      id: 'prod-tea',
      status: 'archived',
      description: null,
      mediaIds: null,
    });

    expect(updated.status).toBe('archived');
    expect(updated.description).toBeUndefined();
    expect(updated.mediaIds).toBeUndefined();
  });

  it('throws when product is missing', async () => {
    const { service } = createService();
    await expect(service.getProduct('tenant-a', 'missing')).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
