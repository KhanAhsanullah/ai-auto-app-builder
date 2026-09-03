import { describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createWebStore } from '../src/infrastructure/create-web-store.js';
import { WebStoreCatalogUnavailableException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('WebStore catalog surface', () => {
  it('lists active products when catalog is wired', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-09-04T04:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });
    await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'milk',
      name: 'Fresh Milk',
      status: 'active',
      variants: [{ sku: 'MILK-1', title: '1L', price: { amount: 2.5, currency: 'PKR' } }],
    });
    await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'draft-tea',
      name: 'Draft Tea',
      status: 'draft',
      variants: [{ sku: 'TEA-1', title: 'Box', price: { amount: 1, currency: 'PKR' } }],
    });

    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    expect(store.isCatalogAvailable()).toBe(true);
    const products = await store.catalogSurface.listActiveProducts();
    expect(products).toHaveLength(1);
    expect(products[0]?.slug).toBe('milk');

    const bySlug = await store.catalogSurface.getProductBySlug('milk');
    expect(bySlug.name).toBe('Fresh Milk');
  });

  it('throws when catalog is not wired', async () => {
    const store = createWebStore({ config: loadResolvedTenantConfig() });
    expect(store.isCatalogAvailable()).toBe(false);
    await expect(store.catalogSurface.listActiveProducts()).rejects.toBeInstanceOf(
      WebStoreCatalogUnavailableException,
    );
  });

  it('throws when modules.catalog is disabled', async () => {
    const catalog = createCatalogModule();
    const base = loadResolvedTenantConfig();
    const config = {
      ...base,
      featureFlags: {
        ...base.featureFlags,
        modules: {
          ...base.featureFlags.modules,
          catalog: false,
        },
      },
    };

    const store = createWebStore({ config, catalog });
    expect(store.isCatalogAvailable()).toBe(false);
    await expect(store.catalogSurface.listActiveProducts()).rejects.toBeInstanceOf(
      WebStoreCatalogUnavailableException,
    );
  });
});
