import {
  buildAdminShellViewModel,
  type AdminShellViewModel,
} from './build-admin-shell-view-model.js';
import {
  createDefaultAdminScreenRegistry,
  type AdminScreenDefinition,
  type AdminScreenRegistry,
} from './admin-screen-registry.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

export interface AdminDashboardDeps {
  shell: ResolvedAdminDashboardShell;
  registry: AdminScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
}

/**
 * Public facade for the config-driven admin dashboard (Sprint 8 Task 3).
 * Holds the resolved shell + screen registry and builds layout view-models.
 */
export class AdminDashboard {
  readonly shell: ResolvedAdminDashboardShell;
  readonly registry: AdminScreenRegistry;
  readonly initialRoute: string;

  constructor(private readonly deps: AdminDashboardDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
  }

  /** Build a layout view-model for the given (or default) active route. */
  getViewModel(activeRoute?: string): AdminShellViewModel {
    return buildAdminShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  /** Register an additional screen on the live registry. */
  registerScreen(screen: AdminScreenDefinition): void {
    this.registry.register(screen);
  }

  /** Whether a route key is registered. */
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
  });
}
