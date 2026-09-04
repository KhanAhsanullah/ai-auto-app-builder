import { describe, expect, it } from 'vitest';

import { createDemoMobileApp } from '../src/infrastructure/create-demo-mobile-app.js';

describe('createDemoMobileApp', () => {
  it('wires catalog/cart and seeds active products', async () => {
    const { app, sessionId } = await createDemoMobileApp({
      now: () => '2026-09-05T00:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });

    expect(sessionId).toBe('mobile-demo');
    expect(app.isCatalogAvailable()).toBe(true);
    expect(app.isCartAvailable()).toBe(true);
    expect(app.isCheckoutAvailable()).toBe(true);
    expect(app.isOrderAvailable()).toBe(true);
    expect(app.isPaymentAvailable()).toBe(true);

    const products = await app.catalogSurface.listActiveProducts();
    expect(products.length).toBeGreaterThanOrEqual(3);
    expect(products.some((p) => p.slug === 'atta')).toBe(true);

    const cart = await app.cartSurface.getOrCreateBySession({ sessionId });
    await app.cartSurface.addItemFromCatalog({
      cartId: cart.id,
      productId: products[0]!.id,
      variantId: products[0]!.variants[0]!.id,
    });
    const updated = await app.cartSurface.getCart(cart.id);
    expect(updated.lines).toHaveLength(1);
  });
});
