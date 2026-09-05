import { describe, expect, it } from 'vitest';

import { createMemoryDemoSnapshotStore } from '../src/demo/demo-snapshot.js';
import { createDemoMobileApp } from '../src/infrastructure/create-demo-mobile-app.js';

describe('createDemoMobileApp', () => {
  it('wires catalog/cart and seeds active products', async () => {
    const { app, sessionId, restoredFromSnapshot } = await createDemoMobileApp({
      now: () => '2026-09-05T00:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });

    expect(restoredFromSnapshot).toBe(false);
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

  it('restores cart lines from a durable snapshot store', async () => {
    const store = createMemoryDemoSnapshotStore();
    const sessionId = 'persist-sess';

    const first = await createDemoMobileApp({
      sessionId,
      snapshotStore: store,
      now: () => '2026-09-05T01:00:00.000Z',
    });
    expect(first.restoredFromSnapshot).toBe(false);

    const products = await first.app.catalogSurface.listActiveProducts();
    const milk = products.find((p) => p.slug === 'milk');
    expect(milk).toBeTruthy();

    const cart = await first.app.cartSurface.getOrCreateBySession({ sessionId });
    await first.app.cartSurface.addItemFromCatalog({
      cartId: cart.id,
      productId: milk!.id,
      variantId: milk!.variants[0]!.id,
      quantity: 2,
    });

    const second = await createDemoMobileApp({
      sessionId,
      snapshotStore: store,
      now: () => '2026-09-05T02:00:00.000Z',
    });
    expect(second.restoredFromSnapshot).toBe(true);

    const restoredCart = await second.app.cartSurface.getOrCreateBySession({ sessionId });
    expect(restoredCart.lines).toHaveLength(1);
    expect(restoredCart.lines[0]?.sku).toBe('MILK-1L');
    expect(restoredCart.lines[0]?.quantity).toBe(2);
  });
});
