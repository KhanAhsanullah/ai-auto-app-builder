import { describe, expect, it } from 'vitest';

import { CatalogService } from '../src/domain/catalog-service.js';
import { CatalogValidationException, CategoryNotFoundException } from '../src/errors.js';
import { InMemoryCatalogRepository } from '../src/infrastructure/in-memory-catalog-repository.js';

function createService() {
  const repository = new InMemoryCatalogRepository();
  let n = 0;
  const service = new CatalogService({
    repository,
    now: () => '2026-08-27T03:00:00.000Z',
    createId: () => `id-${++n}`,
  });
  return { service };
}

const variant = (sku: string) => ({
  sku,
  title: 'Default',
  price: { amount: 1, currency: 'USD' },
});

describe('CatalogService queries', () => {
  async function seed() {
    const { service } = createService();
    await service.createCategory({
      tenantId: 'tenant-a',
      slug: 'fruit',
      name: 'Fruit',
      id: 'cat-fruit',
    });
    await service.createCategory({
      tenantId: 'tenant-a',
      slug: 'dairy',
      name: 'Dairy',
      id: 'cat-dairy',
    });

    await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'organic-apple',
      name: 'Organic Apple',
      status: 'active',
      categoryIds: ['cat-fruit'],
      variants: [variant('APL-1')],
      id: 'prod-apple',
    });
    await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'draft-pear',
      name: 'Draft Pear',
      status: 'draft',
      categoryIds: ['cat-fruit'],
      variants: [variant('PEAR-1')],
      id: 'prod-pear',
    });
    await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'whole-milk',
      name: 'Whole Milk',
      status: 'active',
      categoryIds: ['cat-dairy'],
      variants: [variant('MILK-1')],
      id: 'prod-milk',
    });
    await service.createProduct({
      tenantId: 'tenant-a',
      slug: 'old-cheese',
      name: 'Old Cheese',
      status: 'archived',
      categoryIds: ['cat-dairy'],
      variants: [variant('CHS-1')],
      id: 'prod-cheese',
    });

    return service;
  }

  it('lists products by category', async () => {
    const service = await seed();
    const fruit = await service.listProductsByCategory('tenant-a', 'cat-fruit');
    expect(fruit.map((p) => p.id)).toEqual(['prod-pear', 'prod-apple']);
  });

  it('lists active-only products', async () => {
    const service = await seed();
    const active = await service.listActiveProducts('tenant-a');
    expect(active.map((p) => p.id)).toEqual(['prod-apple', 'prod-milk']);
  });

  it('combines category + activeOnly via listProducts', async () => {
    const service = await seed();
    const result = await service.listProducts('tenant-a', {
      categoryId: 'cat-fruit',
      activeOnly: true,
    });
    expect(result.map((p) => p.id)).toEqual(['prod-apple']);
  });

  it('searches by name or slug (case-insensitive)', async () => {
    const service = await seed();
    const byName = await service.searchProducts('tenant-a', 'APPLE');
    expect(byName.map((p) => p.id)).toEqual(['prod-apple']);

    const bySlug = await service.searchProducts('tenant-a', 'whole');
    expect(bySlug.map((p) => p.id)).toEqual(['prod-milk']);

    const activeSearch = await service.searchProducts('tenant-a', 'o', { activeOnly: true });
    expect(activeSearch.map((p) => p.id)).toEqual(['prod-apple', 'prod-milk']);
  });

  it('filters by explicit status list', async () => {
    const service = await seed();
    const result = await service.listProducts('tenant-a', {
      status: ['draft', 'archived'],
    });
    expect(result.map((p) => p.id)).toEqual(['prod-pear', 'prod-cheese']);
  });

  it('resolves category by slug', async () => {
    const service = await seed();
    await expect(service.getCategoryBySlug('tenant-a', 'fruit')).resolves.toMatchObject({
      id: 'cat-fruit',
    });
    await expect(service.getCategoryBySlug('tenant-a', 'missing')).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it('rejects empty search and activeOnly+status together', async () => {
    const service = await seed();
    await expect(service.searchProducts('tenant-a', '   ')).rejects.toThrow(
      CatalogValidationException,
    );
    await expect(
      service.listProducts('tenant-a', { activeOnly: true, status: 'draft' }),
    ).rejects.toThrow(CatalogValidationException);
  });

  it('rejects unknown category filter', async () => {
    const service = await seed();
    await expect(service.listProductsByCategory('tenant-a', 'missing')).rejects.toThrow(
      CategoryNotFoundException,
    );
  });
});
