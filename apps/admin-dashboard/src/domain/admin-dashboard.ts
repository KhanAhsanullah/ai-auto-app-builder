import type { CatalogModule } from '@ai-commerce/module-catalog';

import {
  buildAdminShellViewModel,
  type AdminShellViewModel,
} from './build-admin-shell-view-model.js';
import {
  createDefaultAdminScreenRegistry,
  type AdminScreenDefinition,
  type AdminScreenRegistry,
} from './admin-screen-registry.js';
import { AdminDashboardCatalogSurface } from './admin-dashboard-catalog-surface.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

export interface AdminDashboardDeps {
  shell: ResolvedAdminDashboardShell;
  registry: AdminScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
  /** Optional catalog module for admin product CRUD. */
  catalog?: CatalogModule;
}

/**
 * Public facade for the config-driven admin dashboard.
 * Holds the resolved shell + screen registry and optional catalog binding.
 */
export class AdminDashboard {
  readonly shell: ResolvedAdminDashboardShell;
  readonly registry: AdminScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: AdminDashboardCatalogSurface;

  constructor(private readonly deps: AdminDashboardDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
    this.catalogSurface = new AdminDashboardCatalogSurface(
      deps.shell,
      deps.catalog ? { catalog: deps.catalog } : undefined,
    );
  }

  isCatalogAvailable(): boolean {
    return this.catalogSurface.isAvailable();
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
  /** Extra screens registered after defaults (when using default registry). */
  extraScreens?: readonly AdminScreenDefinition[];
  catalog?: CatalogModule;
  shellResolver?: never;
  config?: never;
  roles?: never;
}

/** Wire an AdminDashboard from an already-resolved shell (tests / advanced hosts). */
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
  });
}
