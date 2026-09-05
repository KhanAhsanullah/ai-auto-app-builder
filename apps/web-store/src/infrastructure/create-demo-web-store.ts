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
import { createWebStore } from './create-web-store.js';

const demoTenantLayer = demoTenantLayerJson as ConfigLayer;

export interface CreateDemoWebStoreOptions {
  /** Guest session for cart / checkout. Defaults to `web-demo`. */
  sessionId?: string;
  /** Deterministic clock for demos / tests. */
  now?: () => string;
  /** Deterministic id factory for demos / tests. */
  createId?: () => string;
}

export interface DemoWebStoreBundle {
  store: WebStore;
  sessionId: string;
  config: TenantConfiguration;
}

/**
 * Demo storefront: config + catalog/cart/checkout/order/payment wired and seeded.
 * Used by `@ai-commerce/web-host` for a runnable browser buy path.
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

  const catalog = createCatalogModule({
    repository: catalogRepo,
    now,
    createId,
  });
  const cart = createCartModule({
    repository: cartRepo,
    catalogLookup: adaptCatalogProductLookup(catalog),
    now,
    createId,
  });
  const checkout = createCheckoutModule({
    repository: checkoutRepo,
    cartLookup: adaptCartLookup(cart),
    now,
    createId,
  });
  const orders = createOrderModule({
    repository: orderRepo,
    checkoutLookup: adaptCheckoutLookup(checkout),
    now,
    createId,
  });
  const payments = createPaymentModule({
    repository: paymentRepo,
    orderLookup: adaptOrderLookup(orders),
    now,
    createId,
  });

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

  const store = createWebStore({
    config,
    catalog,
    cart,
    checkout,
    orders,
    payments,
    initialRoute: 'store.catalog',
  });

  return { store, sessionId, config };
}
