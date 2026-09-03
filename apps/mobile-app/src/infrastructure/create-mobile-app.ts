import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { OrderModule } from '@ai-commerce/module-order';
import type { CaptureStrategy, PaymentGateway, PaymentModule } from '@ai-commerce/module-payment';
import type { TenantConfiguration } from '@ai-commerce/config-schema';

import { createMobileAppFromShell, type MobileApp } from '../domain/mobile-app.js';
import { MobileAppShellResolver } from '../domain/mobile-app-shell-resolver.js';
import type { MobileScreenDefinition } from '../domain/mobile-screen-registry.js';
import type { MobileScreenRegistry } from '../domain/mobile-screen-registry.js';
import {
  toResolveMobileAppShellInput,
  type MobileAppConfigSource,
} from '../domain/map-config-provider-result.js';

export interface CreateMobileAppOptions {
  config: MobileAppConfigSource;
  shellResolver?: MobileAppShellResolver;
  registry?: MobileScreenRegistry;
  extraScreens?: readonly MobileScreenDefinition[];
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

function resolveConfig(source: MobileAppConfigSource): TenantConfiguration {
  return ('config' in source ? source.config : source) as TenantConfiguration;
}

export function createMobileApp(options: CreateMobileAppOptions): MobileApp {
  const resolver = options.shellResolver ?? new MobileAppShellResolver();
  const shell = resolver.resolve(toResolveMobileAppShellInput(options.config));
  const config = resolveConfig(options.config);
  const defaultCurrency =
    options.defaultCurrency?.trim() || config.currency?.default?.trim() || 'USD';
  const defaultPaymentGateway =
    options.defaultPaymentGateway ??
    (config.payments?.defaultGateway as PaymentGateway | undefined);
  const defaultCaptureStrategy =
    options.defaultCaptureStrategy ??
    (config.payments?.checkout?.captureStrategy as CaptureStrategy | undefined);

  return createMobileAppFromShell({
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
