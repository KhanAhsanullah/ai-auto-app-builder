import type { CatalogModule } from '@ai-commerce/module-catalog';

import { createAdminDashboardFromShell, type AdminDashboard } from '../domain/admin-dashboard.js';
import { AdminDashboardShellResolver } from '../domain/admin-dashboard-shell-resolver.js';
import type { AdminScreenDefinition } from '../domain/admin-screen-registry.js';
import type { AdminScreenRegistry } from '../domain/admin-screen-registry.js';
import {
  toResolveAdminDashboardShellInput,
  type AdminDashboardConfigSource,
} from '../domain/map-config-provider-result.js';

export interface CreateAdminDashboardOptions {
  /** Tenant config or ConfigProvider result. */
  config: AdminDashboardConfigSource;
  /** Admin roles for widget RBAC gating. */
  roles?: readonly string[];
  /** Override shell resolver. */
  shellResolver?: AdminDashboardShellResolver;
  /** Pre-built screen registry (skips default + extraScreens). */
  registry?: AdminScreenRegistry;
  /** Extra screens when using the default registry. */
  extraScreens?: readonly AdminScreenDefinition[];
  /** Initial active route (defaults to landing / first nav). */
  initialRoute?: string;
  /** Optional catalog module — enables admin product CRUD. */
  catalog?: CatalogModule;
}

/**
 * Create the AdminDashboard facade from tenant configuration.
 * One call: resolve shell → registry → ready for React app / view-models.
 */
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
  });
}
