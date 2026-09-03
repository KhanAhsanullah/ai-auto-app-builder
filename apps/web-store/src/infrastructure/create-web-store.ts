import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { OrderModule } from '@ai-commerce/module-order';
import type { CaptureStrategy, PaymentGateway, PaymentModule } from '@ai-commerce/module-payment';
import type { TenantConfiguration } from '@ai-commerce/config-schema';

import { createWebStoreFromShell, type WebStore } from '../domain/web-store.js';
import { WebStoreShellResolver } from '../domain/web-store-shell-resolver.js';
import type { WebScreenDefinition, WebScreenRegistry } from '../domain/web-screen-registry.js';
import {
  toResolveWebStoreShellInput,
  type WebStoreConfigSource,
} from '../domain/map-config-provider-result.js';

export interface CreateWebStoreOptions {
  config: WebStoreConfigSource;
  shellResolver?: WebStoreShellResolver;
  registry?: WebScreenRegistry;
  extraScreens?: readonly WebScreenDefinition[];
  initialRoute?: string;
  catalog?: CatalogModule;
  cart?: CartModule;
  checkout?: CheckoutModule;
  orders?: OrderModule;
  payments?: PaymentModule;
  defaultCurrency?: string;
  defaultPaymentGateway?: PaymentGateway;
  defaultCaptureStrategy?: CaptureStrategy;
}

function resolveConfig(source: WebStoreConfigSource): TenantConfiguration {
  return ('config' in source ? source.config : source) as TenantConfiguration;
}

export function createWebStore(options: CreateWebStoreOptions): WebStore {
  const resolver = options.shellResolver ?? new WebStoreShellResolver();
  const shell = resolver.resolve(toResolveWebStoreShellInput(options.config));
  const config = resolveConfig(options.config);
  const defaultCurrency =
    options.defaultCurrency?.trim() || config.currency?.default?.trim() || 'USD';
  const defaultPaymentGateway =
    options.defaultPaymentGateway ??
    (config.payments?.defaultGateway as PaymentGateway | undefined);
  const defaultCaptureStrategy =
    options.defaultCaptureStrategy ??
    (config.payments?.checkout?.captureStrategy as CaptureStrategy | undefined);

  return createWebStoreFromShell({
    shell,
    registry: options.registry,
    extraScreens: options.extraScreens,
    initialRoute: options.initialRoute,
    catalog: options.catalog,
    cart: options.cart,
    checkout: options.checkout,
    orders: options.orders,
    payments: options.payments,
    defaultCurrency,
    defaultPaymentGateway,
    defaultCaptureStrategy,
  });
}
