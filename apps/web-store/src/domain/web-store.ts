import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';

import { buildWebShellViewModel, type WebShellViewModel } from './build-web-shell-view-model.js';
import {
  createDefaultWebScreenRegistry,
  type WebScreenDefinition,
  type WebScreenRegistry,
} from './web-screen-registry.js';
import { WebStoreCartSurface } from './web-store-cart-surface.js';
import { WebStoreCatalogSurface } from './web-store-catalog-surface.js';
import { WebStoreCheckoutSurface } from './web-store-checkout-surface.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreDeps {
  shell: ResolvedWebStoreShell;
  registry: WebScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
  /** Optional catalog module for storefront product queries. */
  catalog?: CatalogModule;
  /** Optional cart module for storefront cart operations. */
  cart?: CartModule;
  /** Optional checkout module for start-checkout flow. */
  checkout?: CheckoutModule;
  /** Default ISO currency for getOrCreate cart helpers (from tenant config). */
  defaultCurrency?: string;
}

/**
 * Public facade for the config-driven web storefront.
 * Holds the resolved shell + screen registry and optional commerce bindings.
 */
export class WebStore {
  readonly shell: ResolvedWebStoreShell;
  readonly registry: WebScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: WebStoreCatalogSurface;
  readonly cartSurface: WebStoreCartSurface;
  readonly checkoutSurface: WebStoreCheckoutSurface;

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
  defaultCurrency?: string;
}

/** Wire a WebStore from an already-resolved shell (tests / advanced hosts). */
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
    defaultCurrency: options.defaultCurrency,
  });
}
