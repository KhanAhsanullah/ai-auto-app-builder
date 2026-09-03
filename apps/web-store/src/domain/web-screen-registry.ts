import { WebStoreResolutionException } from '../errors.js';
import type { ResolvedWebStoreShell } from '../types.js';

/** Registered web storefront screen mapped from a navigation route key. */
export interface WebScreenDefinition {
  /** Route key (e.g. `store.home`) matching navigation `route`. */
  route: string;
  title: string;
  description?: string;
}

/**
 * In-memory screen-map registry: navigation route keys → screen definitions.
 */
export class WebScreenRegistry {
  private readonly screens = new Map<string, WebScreenDefinition>();

  register(screen: WebScreenDefinition): void {
    const route = screen.route.trim();
    if (!route) {
      throw new WebStoreResolutionException('Web screen route cannot be empty.');
    }
    this.screens.set(route, { ...screen, route });
  }

  registerAll(screens: readonly WebScreenDefinition[]): void {
    for (const screen of screens) {
      this.register(screen);
    }
  }

  has(route: string): boolean {
    return this.screens.has(route);
  }

  get(route: string): WebScreenDefinition | undefined {
    return this.screens.get(route);
  }

  /** Resolve a route or throw when missing. */
  resolve(route: string): WebScreenDefinition {
    const screen = this.get(route);
    if (!screen) {
      throw new WebStoreResolutionException(`No web screen registered for route '${route}'.`);
    }
    return screen;
  }

  list(): WebScreenDefinition[] {
    return [...this.screens.values()];
  }

  /**
   * Pick the active screen for a shell:
   * 1. explicit `activeRoute` when registered
   * 2. shell landing route when registered
   * 3. first primary nav item when registered
   */
  resolveActiveScreen(shell: ResolvedWebStoreShell, activeRoute?: string): WebScreenDefinition {
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

    throw new WebStoreResolutionException(
      'Unable to resolve an active web screen from landing route or navigation.',
    );
  }
}

/** Built-in screens for the standard consumer storefront routes. */
export function createDefaultWebScreens(): WebScreenDefinition[] {
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
      route: 'store.cart',
      title: 'Cart',
      description: 'Review items before checkout.',
    },
    {
      route: 'store.checkout',
      title: 'Checkout',
      description: 'Shipping address and place order.',
    },
    {
      route: 'store.payment',
      title: 'Payment',
      description: 'Confirm payment for your order.',
    },
    {
      route: 'store.orders',
      title: 'Orders',
      description: 'Track and reorder past purchases.',
    },
    {
      route: 'store.profile',
      title: 'Account',
      description: 'Account settings and preferences.',
    },
  ];
}

/** Create a registry preloaded with default storefront screens. */
export function createDefaultWebScreenRegistry(): WebScreenRegistry {
  const registry = new WebScreenRegistry();
  registry.registerAll(createDefaultWebScreens());
  return registry;
}
