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
import {
  buildDemoLaunchConfig,
  type DemoLaunchInput,
  type DemoLaunchVertical,
} from '../demo/build-launch-config.js';
import {
  WEB_DEMO_SNAPSHOT_KEY,
  parseWebDemoSnapshot,
  type WebDemoCommerceSnapshot,
  type WebDemoSnapshotStore,
} from '../demo/demo-snapshot.js';
import { persistOnWrite } from '../demo/persist-on-write.js';
import { seedVerticalDemoCatalog } from '../demo/seed-vertical-catalog.js';
import demoTenantLayerJson from '../demo/full.example.json' with { type: 'json' };
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
  /**
   * Launch wizard input (business name + app type + optional logo).
   * When set (and `tenantConfig` is omitted), builds a fresh tenant layer locally.
   */
  launch?: DemoLaunchInput;
  /**
   * Platform-owned tenant config layer (from GET /v1/tenants/:id/config).
   * Preferred over `launch` when both are provided.
   */
  tenantConfig?: ConfigLayer | Record<string, unknown>;
}
export interface DemoWebStoreBundle {
  store: WebStore;
  sessionId: string;
  config: TenantConfiguration;
  /** True when state was restored from `snapshotStore`. */
  restoredFromSnapshot: boolean;
  /** Active vertical for the running demo. */
  vertical: DemoLaunchVertical | 'grocery';
  /** Display name from launch / config. */
  businessName: string;
}

/**
 * Demo storefront: config + catalog/cart/checkout/order/payment wired and seeded.
 * Prefer `tenantConfig` (platform path); else `launch` (local Boom rebuild); else grocery example.
 */
export async function createDemoWebStore(
  options: CreateDemoWebStoreOptions = {},
): Promise<DemoWebStoreBundle> {
  const sessionId = options.sessionId?.trim() || 'web-demo';
  let idSeq = 0;
  const createId = options.createId ?? (() => `demo-${++idSeq}`);
  const now = options.now ?? (() => new Date().toISOString());

  const built =
    !options.tenantConfig && options.launch ? buildDemoLaunchConfig(options.launch) : undefined;
  const tenantLayer = withDemoSurfaceFlags(
    (options.tenantConfig as ConfigLayer | undefined) ?? built?.tenantLayer ?? demoTenantLayer,
  );

  const provider = new ConfigProvider({ cache: false });
  const resolved = provider.resolve({
    tenantConfig: tenantLayer,
    skipCache: true,
  });
  if (!resolved.validation.success || !resolved.config) {
    const details = resolved.validation.errors?.map((e) => e.message).join('; ');
    throw new Error(
      `Demo tenant config failed ConfigProvider validation.${details ? ` ${details}` : ''}`,
    );
  }
  const config = resolved.config;
  const tenantId = config.tenant.id;
  const vertical = (built?.vertical ?? config.tenant.vertical) as DemoLaunchVertical | 'grocery';
  const businessName = built?.businessName ?? config.company.displayName ?? config.tenant.name;

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
    await seedVerticalDemoCatalog({
      catalog,
      tenantId,
      vertical: vertical === 'grocery' ? 'grocery' : vertical,
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

  return {
    store,
    sessionId,
    config,
    restoredFromSnapshot,
    vertical,
    businessName,
  };
}

/** Ensure demo hosts can open web/mobile shells even when provisioned config disables them. */
function withDemoSurfaceFlags(layer: ConfigLayer): ConfigLayer {
  return {
    ...layer,
    webStore: {
      ...layer.webStore,
      enabled: true,
    },
    mobileApp: {
      ...layer.mobileApp,
      enabled: true,
    },
  };
}
