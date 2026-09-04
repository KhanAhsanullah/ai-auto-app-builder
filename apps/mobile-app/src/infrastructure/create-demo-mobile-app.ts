import { ConfigProvider, type ConfigLayer } from '@ai-commerce/config-runtime';
import type { TenantConfiguration } from '@ai-commerce/config-schema';
import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';
import { createPaymentModule } from '@ai-commerce/module-payment';

import { adaptCartLookup } from '../domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../domain/adapt-catalog-product-lookup.js';
import { adaptCheckoutLookup } from '../domain/adapt-checkout-lookup.js';
import { adaptOrderLookup } from '../domain/adapt-order-lookup.js';
import type { MobileApp } from '../domain/mobile-app.js';
import demoTenantLayerJson from '../demo/full.example.json' with { type: 'json' };
import { createMobileApp } from './create-mobile-app.js';

const demoTenantLayer = demoTenantLayerJson as ConfigLayer;

export interface CreateDemoMobileAppOptions {
  /** Guest session for cart / checkout. Defaults to `mobile-demo`. */
  sessionId?: string;
  /** Deterministic clock for demos / tests. */
  now?: () => string;
  /** Deterministic id factory for demos / tests. */
  createId?: () => string;
}

export interface DemoMobileAppBundle {
  app: MobileApp;
  sessionId: string;
  config: TenantConfiguration;
}

/**
 * In-memory demo store: config + catalog/cart/checkout/order/payment wired and seeded.
 * Used by Expo `@ai-commerce/mobile-host` and unit tests.
 */
export async function createDemoMobileApp(
  options: CreateDemoMobileAppOptions = {},
): Promise<DemoMobileAppBundle> {
  const sessionId = options.sessionId?.trim() || 'mobile-demo';
  let n = 0;
  const createId = options.createId ?? (() => `demo-${++n}`);
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

  const catalog = createCatalogModule({ now, createId });
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
  const orders = createOrderModule({
    checkoutLookup: adaptCheckoutLookup(checkout),
    now,
    createId,
  });
  const payments = createPaymentModule({
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

  const app = createMobileApp({
    config,
    catalog,
    cart,
    checkout,
    orders,
    payments,
    initialRoute: 'store.catalog',
  });

  return { app, sessionId, config };
}
