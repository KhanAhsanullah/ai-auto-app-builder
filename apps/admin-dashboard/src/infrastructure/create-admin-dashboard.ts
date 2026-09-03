import type { CartModule } from '@ai-commerce/module-cart';
import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { OrderModule } from '@ai-commerce/module-order';
import type { PaymentModule } from '@ai-commerce/module-payment';

import { createAdminDashboardFromShell, type AdminDashboard } from '../domain/admin-dashboard.js';
import { AdminDashboardShellResolver } from '../domain/admin-dashboard-shell-resolver.js';
import type { AdminScreenDefinition } from '../domain/admin-screen-registry.js';
import type { AdminScreenRegistry } from '../domain/admin-screen-registry.js';
import {
  toResolveAdminDashboardShellInput,
  type AdminDashboardConfigSource,
} from '../domain/map-config-provider-result.js';

export interface CreateAdminDashboardOptions {
  config: AdminDashboardConfigSource;
  roles?: readonly string[];
  shellResolver?: AdminDashboardShellResolver;
  registry?: AdminScreenRegistry;
  extraScreens?: readonly AdminScreenDefinition[];
  initialRoute?: string;
  catalog?: CatalogModule;
  cart?: CartModule;
  checkout?: CheckoutModule;
  orders?: OrderModule;
  payments?: PaymentModule;
}

export function createAdminDashboard(options: CreateAdminDashboardOptions): AdminDashboard {
  const resolver = options.shellResolver ?? new AdminDashboardShellResolver();
  const shell = resolver.resolve(
    toResolveAdminDashboardShellInput(options.config, { roles: options.roles }),
  );

  return createAdminDashboardFromShell({
    shell,
    registry: options.registry,
    extraScreens: options.extraScreens,
    initialRoute: options.initialRoute,
    catalog: options.catalog,
    cart: options.cart,
    checkout: options.checkout,
    orders: options.orders,
    payments: options.payments,
  });
}
