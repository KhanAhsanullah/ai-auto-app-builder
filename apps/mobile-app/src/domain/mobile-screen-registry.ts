import { MobileAppResolutionException } from '../errors.js';
import type { ResolvedMobileAppShell } from '../types.js';

/** Registered mobile screen mapped from a navigation route key. */
export interface MobileScreenDefinition {
  /** Route key (e.g. `store.home`) matching navigation `route`. */
  route: string;
  title: string;
  description?: string;
}

/**
 * In-memory screen-map registry: navigation route keys → screen definitions.
 */
export class MobileScreenRegistry {
  private readonly screens = new Map<string, MobileScreenDefinition>();

  register(screen: MobileScreenDefinition): void {
    const route = screen.route.trim();
    if (!route) {
      throw new MobileAppResolutionException('Mobile screen route cannot be empty.');
    }
    this.screens.set(route, { ...screen, route });
  }

  registerAll(screens: readonly MobileScreenDefinition[]): void {
    for (const screen of screens) {
      this.register(screen);
    }
  }

  has(route: string): boolean {
    return this.screens.has(route);
  }

  get(route: string): MobileScreenDefinition | undefined {
    return this.screens.get(route);
  }

  /** Resolve a route or throw when missing. */
  resolve(route: string): MobileScreenDefinition {
    const screen = this.get(route);
    if (!screen) {
      throw new MobileAppResolutionException(`No mobile screen registered for route '${route}'.`);
    }
    return screen;
  }

  list(): MobileScreenDefinition[] {
    return [...this.screens.values()];
  }

  /**
   * Pick the active screen for a shell:
   * 1. explicit `activeRoute` when registered
   * 2. shell landing route when registered
   * 3. first primary nav item when registered
   */
  resolveActiveScreen(shell: ResolvedMobileAppShell, activeRoute?: string): MobileScreenDefinition {
    if (activeRoute && this.has(activeRoute)) {
      return this.resolve(activeRoute);
    }

    if (this.has(shell.defaultLandingRoute)) {
      return this.resolve(shell.defaultLandingRoute);
    }

    const firstNav = shell.navigation.primary[0];
    if (firstNav && this.has(firstNav.route)) {
      return this.resolve(firstNav.route);
    }

    throw new MobileAppResolutionException(
      'Unable to resolve an active mobile screen from landing route or navigation.',
    );
  }
}

/** Built-in screens for the standard consumer mobile routes. */
export function createDefaultMobileScreens(): MobileScreenDefinition[] {
  return [
    {
      route: 'store.home',
      title: 'Home',
      description: 'Featured products and store highlights.',
    },
    {
      route: 'store.catalog',
      title: 'Shop',
      description: 'Browse the catalog.',
    },
    {
      route: 'store.orders',
      title: 'Orders',
      description: 'Track and reorder past purchases.',
    },
    {
      route: 'store.profile',
      title: 'Profile',
      description: 'Account settings and preferences.',
    },
  ];
}

/** Create a registry preloaded with default consumer mobile screens. */
export function createDefaultMobileScreenRegistry(): MobileScreenRegistry {
  const registry = new MobileScreenRegistry();
  registry.registerAll(createDefaultMobileScreens());
  return registry;
}
