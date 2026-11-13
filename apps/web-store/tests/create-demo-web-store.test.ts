import { describe, expect, it } from 'vitest';

import {
  clearWebDemoSnapshot,
  createMemoryWebDemoSnapshotStore,
  exportWebDemoSnapshot,
  parseWebDemoSnapshot,
  summarizeWebDemoSnapshot,
} from '../src/demo/demo-snapshot.js';
import { createDemoWebStore } from '../src/infrastructure/create-demo-web-store.js';

describe('createDemoWebStore', () => {
  it('wires catalog/cart and seeds active products', async () => {
    const { store, sessionId, restoredFromSnapshot } = await createDemoWebStore({
      now: () => '2026-09-06T00:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });

    expect(restoredFromSnapshot).toBe(false);
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

  it('restores cart lines from a durable snapshot store', async () => {
    const snapshotStore = createMemoryWebDemoSnapshotStore();
    const sessionId = 'persist-sess';

    const first = await createDemoWebStore({
      sessionId,
      snapshotStore,
      now: () => '2026-09-06T01:00:00.000Z',
    });
    expect(first.restoredFromSnapshot).toBe(false);

    const products = await first.store.catalogSurface.listActiveProducts();
    const milk = products.find((p) => p.slug === 'milk');
    expect(milk).toBeTruthy();

    const cart = await first.store.cartSurface.getOrCreateBySession({ sessionId });
    await first.store.cartSurface.addItemFromCatalog({
      cartId: cart.id,
      productId: milk!.id,
      variantId: milk!.variants[0]!.id,
      quantity: 2,
    });

    const second = await createDemoWebStore({
      sessionId,
      snapshotStore,
      now: () => '2026-09-06T02:00:00.000Z',
    });
    expect(second.restoredFromSnapshot).toBe(true);
    expect(second.config.tenant.id).toBe(first.config.tenant.id);

    const restoredCart = await second.store.cartSurface.getOrCreateBySession({ sessionId });
    expect(restoredCart.lines).toHaveLength(1);
    expect(restoredCart.lines[0]?.sku).toBe('MILK-1L');
    expect(restoredCart.lines[0]?.quantity).toBe(2);
  });

  it('keeps per-tenant snapshots isolated', async () => {
    const snapshotStore = createMemoryWebDemoSnapshotStore();
    const grocery = await createDemoWebStore({
      sessionId: 'sess-g',
      snapshotStore,
      launch: { businessName: 'G Mart', vertical: 'grocery' },
      now: () => '2026-09-06T05:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `g-${++n}`;
      })(),
    });
    const restaurant = await createDemoWebStore({
      sessionId: 'sess-r',
      snapshotStore,
      launch: { businessName: 'R Kitchen', vertical: 'restaurant' },
      now: () => '2026-09-06T05:01:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `r-${++n}`;
      })(),
    });
    expect(grocery.config.tenant.id).not.toBe(restaurant.config.tenant.id);

    const gProducts = await grocery.store.catalogSurface.listActiveProducts();
    const gCart = await grocery.store.cartSurface.getOrCreateBySession({ sessionId: 'sess-g' });
    await grocery.store.cartSurface.addItemFromCatalog({
      cartId: gCart.id,
      productId: gProducts[0]!.id,
      variantId: gProducts[0]!.variants[0]!.id,
    });

    const rReload = await createDemoWebStore({
      sessionId: 'sess-r',
      snapshotStore,
      launch: {
        businessName: 'R Kitchen',
        vertical: 'restaurant',
        tenantId: restaurant.config.tenant.id,
        slug: restaurant.config.tenant.slug,
      },
      now: () => '2026-09-06T05:02:00.000Z',
      createId: (() => {
        let n = 100;
        return () => `r2-${++n}`;
      })(),
    });
    const rCart = await rReload.store.cartSurface.getOrCreateBySession({ sessionId: 'sess-r' });
    expect(rCart.lines).toHaveLength(0);

    const gReload = await createDemoWebStore({
      sessionId: 'sess-g',
      snapshotStore,
      launch: {
        businessName: 'G Mart',
        vertical: 'grocery',
        tenantId: grocery.config.tenant.id,
        slug: grocery.config.tenant.slug,
      },
      now: () => '2026-09-06T05:03:00.000Z',
      createId: (() => {
        let n = 200;
        return () => `g2-${++n}`;
      })(),
    });
    expect(gReload.restoredFromSnapshot).toBe(true);
    const gRestored = await gReload.store.cartSurface.getOrCreateBySession({ sessionId: 'sess-g' });
    expect(gRestored.lines).toHaveLength(1);
  });

  it('clear + recreate drops cart and reseeds catalog', async () => {
    const snapshotStore = createMemoryWebDemoSnapshotStore();
    const sessionId = 'reset-sess';

    const first = await createDemoWebStore({
      sessionId,
      snapshotStore,
      now: () => '2026-09-06T03:00:00.000Z',
    });
    const products = await first.store.catalogSurface.listActiveProducts();
    const cart = await first.store.cartSurface.getOrCreateBySession({ sessionId });
    await first.store.cartSurface.addItemFromCatalog({
      cartId: cart.id,
      productId: products[0]!.id,
      variantId: products[0]!.variants[0]!.id,
    });

    const exported = await exportWebDemoSnapshot(snapshotStore, {
      tenantId: first.config.tenant.id,
    });
    expect(exported).toBeTruthy();
    expect(summarizeWebDemoSnapshot(parseWebDemoSnapshot(exported)!).carts).toBeGreaterThanOrEqual(
      1,
    );

    await clearWebDemoSnapshot(snapshotStore, { tenantId: first.config.tenant.id });
    expect(
      await exportWebDemoSnapshot(snapshotStore, { tenantId: first.config.tenant.id }),
    ).toBeNull();

    const fresh = await createDemoWebStore({
      sessionId: 'reset-sess-2',
      snapshotStore,
      now: () => '2026-09-06T04:00:00.000Z',
    });
    expect(fresh.restoredFromSnapshot).toBe(false);
    const freshCart = await fresh.store.cartSurface.getOrCreateBySession({
      sessionId: 'reset-sess-2',
    });
    expect(freshCart.lines).toHaveLength(0);
    const freshProducts = await fresh.store.catalogSurface.listActiveProducts();
    expect(freshProducts.some((p) => p.slug === 'atta')).toBe(true);
  });
});
