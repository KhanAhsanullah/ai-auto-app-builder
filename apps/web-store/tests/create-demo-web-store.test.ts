import { describe, expect, it } from 'vitest';

import { createDemoWebStore } from '../src/infrastructure/create-demo-web-store.js';

describe('createDemoWebStore', () => {
  it('wires catalog/cart and seeds active products', async () => {
    const { store, sessionId } = await createDemoWebStore({
      now: () => '2026-09-06T00:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });

    expect(sessionId).toBe('web-demo');
    expect(store.isCatalogAvailable()).toBe(true);
    expect(store.isCartAvailable()).toBe(true);
    expect(store.isCheckoutAvailable()).toBe(true);
    expect(store.isOrderAvailable()).toBe(true);
    expect(store.isPaymentAvailable()).toBe(true);

    const products = await store.catalogSurface.listActiveProducts();
    expect(products.length).toBeGreaterThanOrEqual(3);
    expect(products.some((p) => p.slug === 'atta')).toBe(true);

    const cart = await store.cartSurface.getOrCreateBySession({ sessionId });
    await store.cartSurface.addItemFromCatalog({
      cartId: cart.id,
      productId: products[0]!.id,
      variantId: products[0]!.variants[0]!.id,
    });
    const updated = await store.cartSurface.getCart(cart.id);
    expect(updated.lines).toHaveLength(1);
  });
});
