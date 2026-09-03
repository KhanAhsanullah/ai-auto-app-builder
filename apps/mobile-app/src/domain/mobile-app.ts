import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { OrderModule } from '@ai-commerce/module-order';
import type { CaptureStrategy, PaymentGateway, PaymentModule } from '@ai-commerce/module-payment';

import {
  buildMobileShellViewModel,
  type MobileShellViewModel,
} from './build-mobile-shell-view-model.js';
import {
  createDefaultMobileScreenRegistry,
  type MobileScreenDefinition,
  type MobileScreenRegistry,
} from './mobile-screen-registry.js';
import { MobileAppCartSurface } from './mobile-app-cart-surface.js';
import { MobileAppCatalogSurface } from './mobile-app-catalog-surface.js';
import { MobileAppCheckoutSurface } from './mobile-app-checkout-surface.js';
import { MobileAppOrderSurface } from './mobile-app-order-surface.js';
import { MobileAppPaymentSurface } from './mobile-app-payment-surface.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppDeps {
  shell: ResolvedMobileAppShell;
  registry: MobileScreenRegistry;
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

export class MobileApp {
  readonly shell: ResolvedMobileAppShell;
  readonly registry: MobileScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: MobileAppCatalogSurface;
  readonly cartSurface: MobileAppCartSurface;
  readonly checkoutSurface: MobileAppCheckoutSurface;
  readonly orderSurface: MobileAppOrderSurface;
  readonly paymentSurface: MobileAppPaymentSurface;

  constructor(private readonly deps: MobileAppDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
    this.catalogSurface = new MobileAppCatalogSurface(
      deps.shell,
      deps.catalog ? { catalog: deps.catalog } : undefined,
    );
    this.cartSurface = new MobileAppCartSurface(
      deps.shell,
      deps.cart
        ? { cart: deps.cart, defaultCurrency: deps.defaultCurrency?.trim() || 'USD' }
        : undefined,
    );
    this.checkoutSurface = new MobileAppCheckoutSurface(
      deps.shell,
      deps.checkout ? { checkout: deps.checkout } : undefined,
    );
    this.orderSurface = new MobileAppOrderSurface(
      deps.shell,
      deps.orders ? { orders: deps.orders } : undefined,
    );
    this.paymentSurface = new MobileAppPaymentSurface(
      deps.shell,
      deps.payments
        ? {
            payments: deps.payments,
            defaultGateway: deps.defaultPaymentGateway,
            defaultCaptureStrategy: deps.defaultCaptureStrategy,
          }
        : undefined,
    );
  }

  isCatalogAvailable(): boolean {
    return this.catalogSurface.isAvailable();
  }

  isCartAvailable(): boolean {
    return this.cartSurface.isAvailable();
  }

  isCheckoutAvailable(): boolean {
    return this.checkoutSurface.isAvailable();
  }

  isOrderAvailable(): boolean {
    return this.orderSurface.isAvailable();
  }

  isPaymentAvailable(): boolean {
    return this.paymentSurface.isAvailable();
  }

  getViewModel(activeRoute?: string): MobileShellViewModel {
    return buildMobileShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  registerScreen(screen: MobileScreenDefinition): void {
    this.registry.register(screen);
  }

  hasScreen(route: string): boolean {
    return this.registry.has(route);
  }
}

export interface CreateMobileAppFromShellOptions {
  shell: ResolvedMobileAppShell;
  registry?: MobileScreenRegistry;
  initialRoute?: string;
  extraScreens?: readonly MobileScreenDefinition[];
  catalog?: CatalogModule;
  cart?: CartModule;
  checkout?: CheckoutModule;
  orders?: OrderModule;
  payments?: PaymentModule;
  defaultCurrency?: string;
  defaultPaymentGateway?: PaymentGateway;
  defaultCaptureStrategy?: CaptureStrategy;
}

export function createMobileAppFromShell(options: CreateMobileAppFromShellOptions): MobileApp {
  const registry = options.registry ?? createDefaultMobileScreenRegistry();
  if (!options.registry && options.extraScreens) {
    registry.registerAll(options.extraScreens);
  }

  return new MobileApp({
    shell: options.shell,
    registry,
    initialRoute: options.initialRoute,
    catalog: options.catalog,
    cart: options.cart,
    checkout: options.checkout,
    orders: options.orders,
    payments: options.payments,
    defaultCurrency: options.defaultCurrency,
    defaultPaymentGateway: options.defaultPaymentGateway,
    defaultCaptureStrategy: options.defaultCaptureStrategy,
  });
}
