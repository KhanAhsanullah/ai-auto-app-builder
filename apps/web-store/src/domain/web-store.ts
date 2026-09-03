import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { OrderModule } from '@ai-commerce/module-order';
import type { CaptureStrategy, PaymentGateway, PaymentModule } from '@ai-commerce/module-payment';

import { buildWebShellViewModel, type WebShellViewModel } from './build-web-shell-view-model.js';
import {
  createDefaultWebScreenRegistry,
  type WebScreenDefinition,
  type WebScreenRegistry,
} from './web-screen-registry.js';
import { WebStoreCartSurface } from './web-store-cart-surface.js';
import { WebStoreCatalogSurface } from './web-store-catalog-surface.js';
import { WebStoreCheckoutSurface } from './web-store-checkout-surface.js';
import { WebStoreOrderSurface } from './web-store-order-surface.js';
import { WebStorePaymentSurface } from './web-store-payment-surface.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreDeps {
  shell: ResolvedWebStoreShell;
  registry: WebScreenRegistry;
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

/**
 * Public facade for the config-driven web storefront.
 */
export class WebStore {
  readonly shell: ResolvedWebStoreShell;
  readonly registry: WebScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: WebStoreCatalogSurface;
  readonly cartSurface: WebStoreCartSurface;
  readonly checkoutSurface: WebStoreCheckoutSurface;
  readonly orderSurface: WebStoreOrderSurface;
  readonly paymentSurface: WebStorePaymentSurface;

  constructor(private readonly deps: WebStoreDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
    this.catalogSurface = new WebStoreCatalogSurface(
      deps.shell,
      deps.catalog ? { catalog: deps.catalog } : undefined,
    );
    this.cartSurface = new WebStoreCartSurface(
      deps.shell,
      deps.cart
        ? { cart: deps.cart, defaultCurrency: deps.defaultCurrency?.trim() || 'USD' }
        : undefined,
    );
    this.checkoutSurface = new WebStoreCheckoutSurface(
      deps.shell,
      deps.checkout ? { checkout: deps.checkout } : undefined,
    );
    this.orderSurface = new WebStoreOrderSurface(
      deps.shell,
      deps.orders ? { orders: deps.orders } : undefined,
    );
    this.paymentSurface = new WebStorePaymentSurface(
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

  getViewModel(activeRoute?: string): WebShellViewModel {
    return buildWebShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  registerScreen(screen: WebScreenDefinition): void {
    this.registry.register(screen);
  }

  hasScreen(route: string): boolean {
    return this.registry.has(route);
  }
}

export interface CreateWebStoreFromShellOptions {
  shell: ResolvedWebStoreShell;
  registry?: WebScreenRegistry;
  initialRoute?: string;
  extraScreens?: readonly WebScreenDefinition[];
  catalog?: CatalogModule;
  cart?: CartModule;
  checkout?: CheckoutModule;
  orders?: OrderModule;
  payments?: PaymentModule;
  defaultCurrency?: string;
  defaultPaymentGateway?: PaymentGateway;
  defaultCaptureStrategy?: CaptureStrategy;
}

export function createWebStoreFromShell(options: CreateWebStoreFromShellOptions): WebStore {
  const registry = options.registry ?? createDefaultWebScreenRegistry();
  if (!options.registry && options.extraScreens) {
    registry.registerAll(options.extraScreens);
  }

  return new WebStore({
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
