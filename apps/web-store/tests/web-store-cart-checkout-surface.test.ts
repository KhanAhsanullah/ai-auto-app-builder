import { describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';

import { adaptCartLookup } from '../src/domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../src/domain/adapt-catalog-product-lookup.js';
import { createWebStore } from '../src/infrastructure/create-web-store.js';
import {
  WebStoreCartUnavailableException,
  WebStoreCheckoutUnavailableException,
} from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('WebStore cart + checkout surfaces', () => {
  it('adds from catalog and starts checkout', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T05:00:00.000Z';

    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'bread',
      name: 'Bread',
      status: 'active',
      variants: [{ sku: 'BRD-1', title: 'Loaf', price: { amount: 3, currency: 'PKR' } }],
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

    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
      checkout,
    });

    expect(store.isCartAvailable()).toBe(true);
    expect(store.isCheckoutAvailable()).toBe(true);

    const sessionCart = await store.cartSurface.getOrCreateBySession({
      sessionId: 'sess-1',
      id: 'cart-1',
    });
    expect(sessionCart.currency).toBe('PKR');

    const withItem = await store.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });
    expect(withItem.lines).toHaveLength(1);
    expect(withItem.subtotal.amount).toBe(3);

    const session = await store.checkoutSurface.startCheckout(sessionCart.id, 'chk-1');
    expect(session.status).toBe('draft');
    expect(session.lines).toHaveLength(1);
  });

  it('throws when cart / checkout are not wired', async () => {
    const store = createWebStore({ config: loadResolvedTenantConfig() });
    expect(store.isCartAvailable()).toBe(false);
    expect(store.isCheckoutAvailable()).toBe(false);
    await expect(store.cartSurface.getOrCreateBySession({ sessionId: 'x' })).rejects.toBeInstanceOf(
      WebStoreCartUnavailableException,
    );
    await expect(store.checkoutSurface.startCheckout('cart-x')).rejects.toBeInstanceOf(
      WebStoreCheckoutUnavailableException,
    );
  });
});
