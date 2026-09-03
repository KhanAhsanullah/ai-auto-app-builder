import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { OrderModule } from '@ai-commerce/module-order';
import type { PaymentModule } from '@ai-commerce/module-payment';

import {
  buildAdminShellViewModel,
  type AdminShellViewModel,
} from './build-admin-shell-view-model.js';
import {
  createDefaultAdminScreenRegistry,
  type AdminScreenDefinition,
  type AdminScreenRegistry,
} from './admin-screen-registry.js';
import {
  AdminDashboardCartSurface,
  AdminDashboardCheckoutSurface,
} from './admin-dashboard-cart-checkout-surface.js';
import { AdminDashboardCatalogSurface } from './admin-dashboard-catalog-surface.js';
import {
  AdminDashboardOrderSurface,
  AdminDashboardPaymentSurface,
} from './admin-dashboard-order-payment-surface.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

export interface AdminDashboardDeps {
  shell: ResolvedAdminDashboardShell;
  registry: AdminScreenRegistry;
  initialRoute?: string;
  catalog?: CatalogModule;
  cart?: CartModule;
  checkout?: CheckoutModule;
  orders?: OrderModule;
  payments?: PaymentModule;
}

export class AdminDashboard {
  readonly shell: ResolvedAdminDashboardShell;
  readonly registry: AdminScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: AdminDashboardCatalogSurface;
  readonly cartSurface: AdminDashboardCartSurface;
  readonly checkoutSurface: AdminDashboardCheckoutSurface;
  readonly orderSurface: AdminDashboardOrderSurface;
  readonly paymentSurface: AdminDashboardPaymentSurface;

  constructor(private readonly deps: AdminDashboardDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
    this.catalogSurface = new AdminDashboardCatalogSurface(
      deps.shell,
      deps.catalog ? { catalog: deps.catalog } : undefined,
    );
    this.cartSurface = new AdminDashboardCartSurface(
      deps.shell,
      deps.cart ? { cart: deps.cart } : undefined,
    );
    this.checkoutSurface = new AdminDashboardCheckoutSurface(
      deps.shell,
      deps.checkout ? { checkout: deps.checkout } : undefined,
    );
    this.orderSurface = new AdminDashboardOrderSurface(
      deps.shell,
      deps.orders ? { orders: deps.orders } : undefined,
    );
    this.paymentSurface = new AdminDashboardPaymentSurface(
      deps.shell,
      deps.payments ? { payments: deps.payments } : undefined,
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

  getViewModel(activeRoute?: string): AdminShellViewModel {
    return buildAdminShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  registerScreen(screen: AdminScreenDefinition): void {
    this.registry.register(screen);
  }

  hasScreen(route: string): boolean {
    return this.registry.has(route);
  }
}

export interface CreateAdminDashboardFromShellOptions {
  shell: ResolvedAdminDashboardShell;
  registry?: AdminScreenRegistry;
  initialRoute?: string;
  extraScreens?: readonly AdminScreenDefinition[];
  catalog?: CatalogModule;
  cart?: CartModule;
  checkout?: CheckoutModule;
  orders?: OrderModule;
  payments?: PaymentModule;
  shellResolver?: never;
  config?: never;
  roles?: never;
}

export function createAdminDashboardFromShell(
  options: CreateAdminDashboardFromShellOptions,
): AdminDashboard {
  const registry = options.registry ?? createDefaultAdminScreenRegistry();
  if (!options.registry && options.extraScreens) {
    registry.registerAll(options.extraScreens);
  }

  return new AdminDashboard({
    shell: options.shell,
    registry,
    initialRoute: options.initialRoute,
    catalog: options.catalog,
    cart: options.cart,
    checkout: options.checkout,
    orders: options.orders,
    payments: options.payments,
  });
}
