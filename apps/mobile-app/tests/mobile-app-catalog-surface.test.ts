import { describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createMobileApp } from '../src/infrastructure/create-mobile-app.js';
import { MobileAppCatalogUnavailableException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('MobileApp catalog surface', () => {
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
      slug: 'yogurt',
      name: 'Yogurt',
      status: 'active',
      variants: [{ sku: 'YOG-1', title: 'Cup', price: { amount: 1.5, currency: 'PKR' } }],
    });

    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    expect(app.isCatalogAvailable()).toBe(true);
    const products = await app.catalogSurface.listActiveProducts();
    expect(products).toMatchObject([{ slug: 'yogurt', name: 'Yogurt' }]);
  });

  it('throws when catalog is not wired', async () => {
    const app = createMobileApp({ config: loadResolvedTenantConfig() });
    expect(app.isCatalogAvailable()).toBe(false);
    await expect(app.catalogSurface.listActiveProducts()).rejects.toBeInstanceOf(
      MobileAppCatalogUnavailableException,
    );
  });
});
