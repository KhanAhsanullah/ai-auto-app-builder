/** Store routes that can appear in shareable `/t/:slug/...` URLs. */
export const SHAREABLE_STORE_ROUTES = [
  'store.home',
  'store.catalog',
  'store.cart',
  'store.checkout',
  'store.payment',
  'store.orders',
  'store.profile',
] as const;

export type ShareableStoreRoute = (typeof SHAREABLE_STORE_ROUTES)[number];

const ROUTE_SET = new Set<string>(SHAREABLE_STORE_ROUTES);

export interface ShareablePath {
  slug: string;
  route: ShareableStoreRoute;
}

const SCREEN_TO_PATH: Record<ShareableStoreRoute, string> = {
  'store.home': 'home',
  'store.catalog': 'catalog',
  'store.cart': 'cart',
  'store.checkout': 'checkout',
  'store.payment': 'payment',
  'store.orders': 'orders',
  'store.profile': 'profile',
};

/**
 * Parse a shareable storefront path.
 *
 * Accepts:
 * - `/t/spice-route`
 * - `/t/spice-route/cart`
 * - `/t/spice-route/store/cart`
 */
export function parseShareablePath(pathname: string | null | undefined): ShareablePath | undefined {
  if (!pathname?.trim()) {
    return undefined;
  }

  const segments = pathname
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  if (segments[0] !== 't' || !segments[1]) {
    return undefined;
  }

  const slug = segments[1];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return undefined;
  }

  const rest = segments.slice(2);
  let route: ShareableStoreRoute = 'store.catalog';

  if (rest.length > 0) {
    let candidate: string | undefined;
    if (rest[0]?.startsWith('store.')) {
      candidate = rest[0];
    } else if (rest[0] === 'store' && rest[1]) {
      candidate = `store.${rest[1]}`;
    } else if (rest.length >= 1) {
      candidate = `store.${rest[0]}`;
    }
    if (candidate && ROUTE_SET.has(candidate)) {
      route = candidate as ShareableStoreRoute;
    }
  }

  return { slug, route };
}

/** Build a shareable path for a tenant slug + store route. */
export function buildShareablePath(
  slug: string,
  route: ShareableStoreRoute = 'store.catalog',
): string {
  const normalizedSlug = slug.trim().toLowerCase();
  const screen = SCREEN_TO_PATH[route] ?? 'catalog';
  if (route === 'store.catalog') {
    return `/t/${normalizedSlug}`;
  }
  return `/t/${normalizedSlug}/${screen}`;
}

/** Map an internal `store.*` route to a shareable route (fallback catalog). */
export function toShareableStoreRoute(route: string | undefined): ShareableStoreRoute {
  if (route && ROUTE_SET.has(route)) {
    return route as ShareableStoreRoute;
  }
  return 'store.catalog';
}
