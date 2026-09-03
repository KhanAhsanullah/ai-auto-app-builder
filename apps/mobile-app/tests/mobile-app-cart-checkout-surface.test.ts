import { describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';

import { adaptCartLookup } from '../src/domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../src/domain/adapt-catalog-product-lookup.js';
import { createMobileApp } from '../src/infrastructure/create-mobile-app.js';
import { MobileAppCartUnavailableException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('MobileApp cart + checkout surfaces', () => {
  it('adds from catalog and starts checkout', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T05:00:00.000Z';

    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'eggs',
      name: 'Eggs',
      status: 'active',
      variants: [{ sku: 'EGG-1', title: 'Dozen', price: { amount: 5, currency: 'PKR' } }],
    });

    const cart = createCartModule({
      catalogLookup: adaptCatalogProductLookup(catalog),
      now,
      createId,
    });
    const checkout = createCheckoutModule({
      cartLookup: adaptCartLookup(cart),
      now,
      createId,
    });

    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
      checkout,
    });

    const sessionCart = await app.cartSurface.getOrCreateBySession({
      sessionId: 'm-sess',
      id: 'm-cart',
    });
    await app.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });
    const session = await app.checkoutSurface.startCheckout(sessionCart.id);
    expect(session.lines[0]?.sku).toBe('EGG-1');
  });

  it('throws when cart is not wired', async () => {
    const app = createMobileApp({ config: loadResolvedTenantConfig() });
    await expect(app.cartSurface.getOrCreateBySession({ sessionId: 'x' })).rejects.toBeInstanceOf(
      MobileAppCartUnavailableException,
    );
  });
});
