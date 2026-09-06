import { ConfigProvider, type ConfigLayer } from '@ai-commerce/config-runtime';
import type { TenantConfiguration } from '@ai-commerce/config-schema';
import { createCartModule, InMemoryCartRepository } from '@ai-commerce/module-cart';
import { createCatalogModule, InMemoryCatalogRepository } from '@ai-commerce/module-catalog';
import { createCheckoutModule, InMemoryCheckoutRepository } from '@ai-commerce/module-checkout';
import { createOrderModule, InMemoryOrderRepository } from '@ai-commerce/module-order';
import { createPaymentModule, InMemoryPaymentRepository } from '@ai-commerce/module-payment';

import { adaptCartLookup } from '../domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../domain/adapt-catalog-product-lookup.js';
import { adaptCheckoutLookup } from '../domain/adapt-checkout-lookup.js';
import { adaptOrderLookup } from '../domain/adapt-order-lookup.js';
import type { WebStore } from '../domain/web-store.js';
import demoTenantLayerJson from '../demo/full.example.json' with { type: 'json' };
import {
  WEB_DEMO_SNAPSHOT_KEY,
  parseWebDemoSnapshot,
  type WebDemoCommerceSnapshot,
  type WebDemoSnapshotStore,
} from '../demo/demo-snapshot.js';
import { persistOnWrite } from '../demo/persist-on-write.js';
import { createWebStore } from './create-web-store.js';

const demoTenantLayer = demoTenantLayerJson as ConfigLayer;

export interface CreateDemoWebStoreOptions {
  /** Guest session for cart / checkout. Defaults to `web-demo`. */
  sessionId?: string;
  /** Deterministic clock for demos / tests. */
  now?: () => string;
  /** Deterministic id factory for demos / tests. */
  createId?: () => string;
  /**
   * Optional durable store (e.g. localStorage). When set, cart/orders/catalog
   * survive browser reloads for the demo host.
   */
  snapshotStore?: WebDemoSnapshotStore;
}

export interface DemoWebStoreBundle {
  store: WebStore;
  sessionId: string;
  config: TenantConfiguration;
  /** True when state was restored from `snapshotStore`. */
  restoredFromSnapshot: boolean;
}

/**
 * Demo storefront: config + catalog/cart/checkout/order/payment wired and seeded.
 * Optionally persists a commerce snapshot for Vite host reloads.
 */
export async function createDemoWebStore(
  options: CreateDemoWebStoreOptions = {},
): Promise<DemoWebStoreBundle> {
  const sessionId = options.sessionId?.trim() || 'web-demo';
  let idSeq = 0;
  const createId = options.createId ?? (() => `demo-${++idSeq}`);
  const now = options.now ?? (() => new Date().toISOString());

  const provider = new ConfigProvider({ cache: false });
  const resolved = provider.resolve({
    tenantConfig: demoTenantLayer,
    skipCache: true,
  });
  if (!resolved.validation.success || !resolved.config) {
    throw new Error('Demo tenant config failed ConfigProvider validation.');
  }
  const config = resolved.config;
  const tenantId = config.tenant.id;

  const catalogRepo = new InMemoryCatalogRepository();
  const cartRepo = new InMemoryCartRepository();
  const checkoutRepo = new InMemoryCheckoutRepository();
  const orderRepo = new InMemoryOrderRepository();
  const paymentRepo = new InMemoryPaymentRepository();

  const buildSnapshot = (): WebDemoCommerceSnapshot => ({
    version: 1,
    idSeq,
    products: catalogRepo.dumpProducts(),
    categories: catalogRepo.dumpCategories(),
    carts: cartRepo.dump(),
    checkouts: checkoutRepo.dump(),
    orders: orderRepo.dump(),
    payments: paymentRepo.dump(),
  });

  let persistQueue: Promise<void> = Promise.resolve();
  const persist = async () => {
    if (!options.snapshotStore) {
      return;
    }
    persistQueue = persistQueue.then(async () => {
      await options.snapshotStore!.setItem(WEB_DEMO_SNAPSHOT_KEY, JSON.stringify(buildSnapshot()));
    });
    await persistQueue;
  };

  const catalog = createCatalogModule({
    repository: persistOnWrite(catalogRepo, persist),
    now,
    createId,
  });
  const cart = createCartModule({
    repository: persistOnWrite(cartRepo, persist),
    catalogLookup: adaptCatalogProductLookup(catalog),
    now,
    createId,
  });
  const checkout = createCheckoutModule({
    repository: persistOnWrite(checkoutRepo, persist),
    cartLookup: adaptCartLookup(cart),
    now,
    createId,
  });
  const orders = createOrderModule({
    repository: persistOnWrite(orderRepo, persist),
    checkoutLookup: adaptCheckoutLookup(checkout),
    now,
    createId,
  });
  const payments = createPaymentModule({
    repository: persistOnWrite(paymentRepo, persist),
    orderLookup: adaptOrderLookup(orders),
    now,
    createId,
  });

  let restoredFromSnapshot = false;
  const raw = options.snapshotStore
    ? await options.snapshotStore.getItem(WEB_DEMO_SNAPSHOT_KEY)
    : null;
  const snapshot = parseWebDemoSnapshot(raw);

  if (snapshot && snapshot.products.length > 0) {
    idSeq = Math.max(idSeq, snapshot.idSeq);
    catalogRepo.hydrate({
      products: snapshot.products,
      categories: snapshot.categories,
    });
    cartRepo.hydrate(snapshot.carts);
    checkoutRepo.hydrate(snapshot.checkouts);
    orderRepo.hydrate(snapshot.orders);
    paymentRepo.hydrate(snapshot.payments);
    restoredFromSnapshot = true;
  } else {
    await catalog.createProduct({
      tenantId,
      slug: 'atta',
      name: 'Atta Flour',
      status: 'active',
      variants: [{ sku: 'ATTA-5KG', title: '5kg', price: { amount: 1200, currency: 'PKR' } }],
    });
    await catalog.createProduct({
      tenantId,
      slug: 'milk',
      name: 'Fresh Milk',
      status: 'active',
      variants: [{ sku: 'MILK-1L', title: '1L', price: { amount: 280, currency: 'PKR' } }],
    });
    await catalog.createProduct({
      tenantId,
      slug: 'eggs',
      name: 'Farm Eggs',
      status: 'active',
      variants: [{ sku: 'EGG-12', title: 'Dozen', price: { amount: 450, currency: 'PKR' } }],
    });
  }

  const store = createWebStore({
    config,
    catalog,
    cart,
    checkout,
    orders,
    payments,
    initialRoute: 'store.catalog',
  });

  return { store, sessionId, config, restoredFromSnapshot };
}
