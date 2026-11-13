/**
 * Ensure Boom / platform tenant layers expose About + Contact in web nav + footer.
 */
export function enrichStorefrontNav(document: Record<string, unknown>): Record<string, unknown> {
  const next = structuredClone(document) as Record<string, unknown>;
  const navigation =
    next.navigation && typeof next.navigation === 'object' && !Array.isArray(next.navigation)
      ? { ...(next.navigation as Record<string, unknown>) }
      : {};
  const web =
    navigation.web && typeof navigation.web === 'object' && !Array.isArray(navigation.web)
      ? { ...(navigation.web as Record<string, unknown>) }
      : {};

  const primary = Array.isArray(web.primary) ? [...web.primary] : [];
  ensureNavItem(primary, {
    id: 'about',
    label: 'About',
    route: 'store.about',
  });
  ensureNavItem(primary, {
    id: 'contact',
    label: 'Contact',
    route: 'store.contact',
  });
  web.primary = primary;

  const footer = Array.isArray(web.footer) ? [...web.footer] : [];
  ensureNavItem(footer, {
    id: 'about',
    label: 'About',
    route: 'store.about',
  });
  ensureNavItem(footer, {
    id: 'contact',
    label: 'Contact',
    route: 'store.contact',
  });
  ensureNavItem(footer, {
    id: 'shop',
    label: 'Shop',
    route: 'store.catalog',
  });
  web.footer = footer;

  navigation.web = web;
  next.navigation = navigation;
  return next;
}

function ensureNavItem(items: unknown[], item: { id: string; label: string; route: string }): void {
  const exists = items.some((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return false;
    }
    return (row as { route?: unknown }).route === item.route;
  });
  if (!exists) {
    items.push(item);
  }
}
