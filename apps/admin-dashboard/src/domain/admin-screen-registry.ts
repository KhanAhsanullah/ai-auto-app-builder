import { AdminDashboardResolutionException } from '../errors.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

/** Registered admin screen mapped from a navigation route key. */
export interface AdminScreenDefinition {
  /** Route key (e.g. `admin.dashboard`) matching navigation `route`. */
  route: string;
  title: string;
  description?: string;
  /** Optional widget ids this screen highlights from the shell. */
  widgetIds?: readonly string[];
}

/**
 * In-memory screen-map registry: navigation route keys → screen definitions.
 */
export class AdminScreenRegistry {
  private readonly screens = new Map<string, AdminScreenDefinition>();

  register(screen: AdminScreenDefinition): void {
    const route = screen.route.trim();
    if (!route) {
      throw new AdminDashboardResolutionException('Admin screen route cannot be empty.');
    }
    this.screens.set(route, { ...screen, route });
  }

  registerAll(screens: readonly AdminScreenDefinition[]): void {
    for (const screen of screens) {
      this.register(screen);
    }
  }

  has(route: string): boolean {
    return this.screens.has(route);
  }

  get(route: string): AdminScreenDefinition | undefined {
    return this.screens.get(route);
  }

  /** Resolve a route or throw when missing. */
  resolve(route: string): AdminScreenDefinition {
    const screen = this.get(route);
    if (!screen) {
      throw new AdminDashboardResolutionException(
        `No admin screen registered for route '${route}'.`,
      );
    }
    return screen;
  }

  list(): AdminScreenDefinition[] {
    return [...this.screens.values()];
  }

  /**
   * Pick the active screen for a shell:
   * 1. explicit `activeRoute` when registered
   * 2. shell landing route when registered
   * 3. first primary nav item when registered
   */
  resolveActiveScreen(
    shell: ResolvedAdminDashboardShell,
    activeRoute?: string,
  ): AdminScreenDefinition {
    if (activeRoute && this.has(activeRoute)) {
      return this.resolve(activeRoute);
    }

    const landing = shell.layout.defaultLandingRoute;
    if (this.has(landing)) {
      return this.resolve(landing);
    }

    const firstNav = shell.navigation.primary[0];
    if (firstNav && this.has(firstNav.route)) {
      return this.resolve(firstNav.route);
    }

    throw new AdminDashboardResolutionException(
      'Unable to resolve an active admin screen from landing route or navigation.',
    );
  }
}

/** Built-in screens for the standard merchant admin routes. */
export function createDefaultAdminScreens(): AdminScreenDefinition[] {
  return [
    {
      route: 'admin.dashboard',
      title: 'Dashboard',
      description: 'Overview widgets and operational summary.',
      widgetIds: ['orders-summary', 'revenue-chart'],
    },
    {
      route: 'admin.orders',
      title: 'Orders',
      description: 'Order list and fulfillment workflows.',
    },
    {
      route: 'admin.catalog',
      title: 'Catalog',
      description: 'Products, categories, and inventory.',
    },
    {
      route: 'admin.settings',
      title: 'Settings',
      description: 'Tenant preferences and admin configuration.',
    },
  ];
}

/** Create a registry preloaded with default merchant admin screens. */
export function createDefaultAdminScreenRegistry(): AdminScreenRegistry {
  const registry = new AdminScreenRegistry();
  registry.registerAll(createDefaultAdminScreens());
  return registry;
}
