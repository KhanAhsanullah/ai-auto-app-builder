/** Routes the Expo host may open via deep link. */
export const DEEP_LINK_ROUTES = [
  'store.home',
  'store.catalog',
  'store.cart',
  'store.checkout',
  'store.payment',
  'store.orders',
  'store.profile',
] as const;

export type DeepLinkRoute = (typeof DEEP_LINK_ROUTES)[number];

const ROUTE_SET = new Set<string>(DEEP_LINK_ROUTES);

/**
 * Map a deep-link URL to a `store.*` screen route.
 *
 * Accepts:
 * - `aicommerce://store/cart`
 * - `aicommerce://cart`
 * - `https://host/store/orders`
 * - Expo Go paths ending in `/--/store/checkout`
 */
export function parseDeepLinkRoute(url: string | null | undefined): DeepLinkRoute | undefined {
  if (!url?.trim()) {
    return undefined;
  }

  let pathname = '';
  try {
    const parsed = new URL(url.trim());
    pathname = parsed.pathname || '';
    // Custom schemes often put the path in hostname: aicommerce://cart
    if ((!pathname || pathname === '/') && parsed.hostname) {
      pathname = `/${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
    }
  } catch {
    pathname = url.trim();
  }

  const normalized = pathname
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/^--+\/?/, '')
    .toLowerCase();

  if (!normalized) {
    return undefined;
  }

  const segments = normalized.split('/').filter(Boolean);
  // Drop Expo Go prefix segments before store/...
  const storeIdx = segments.findIndex((s) => s === 'store' || s.startsWith('store.'));
  const relevant = storeIdx >= 0 ? segments.slice(storeIdx) : segments;

  let candidate: string | undefined;
  if (relevant[0]?.startsWith('store.')) {
    candidate = relevant[0];
  } else if (relevant[0] === 'store' && relevant[1]) {
    candidate = `store.${relevant[1]}`;
  } else if (relevant.length === 1) {
    candidate = `store.${relevant[0]}`;
  }

  if (!candidate) {
    return undefined;
  }

  return ROUTE_SET.has(candidate) ? (candidate as DeepLinkRoute) : undefined;
}
