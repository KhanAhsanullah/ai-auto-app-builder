/**
 * Ensure Boom tenant configs expose catalog admin navigation + module flag.
 * Does not mutate the platform document in place.
 */
export function enrichAdminConfigDocument(
  document: Record<string, unknown>,
): Record<string, unknown> {
  const next = structuredClone(document) as Record<string, unknown>;

  const featureFlags =
    next.featureFlags && typeof next.featureFlags === 'object' && !Array.isArray(next.featureFlags)
      ? { ...(next.featureFlags as Record<string, unknown>) }
      : {};
  const modules =
    featureFlags.modules &&
    typeof featureFlags.modules === 'object' &&
    !Array.isArray(featureFlags.modules)
      ? { ...(featureFlags.modules as Record<string, unknown>) }
      : {};
  modules.catalog = true;
  featureFlags.modules = modules;
  featureFlags.flags =
    featureFlags.flags &&
    typeof featureFlags.flags === 'object' &&
    !Array.isArray(featureFlags.flags)
      ? featureFlags.flags
      : {};
  next.featureFlags = featureFlags;

  const navigation =
    next.navigation && typeof next.navigation === 'object' && !Array.isArray(next.navigation)
      ? { ...(next.navigation as Record<string, unknown>) }
      : {};
  const admin =
    navigation.admin && typeof navigation.admin === 'object' && !Array.isArray(navigation.admin)
      ? { ...(navigation.admin as Record<string, unknown>) }
      : {};
  const primary = Array.isArray(admin.primary) ? [...admin.primary] : [];
  const hasCatalog = primary.some((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return false;
    }
    return (item as { route?: unknown }).route === 'admin.catalog';
  });
  if (!hasCatalog) {
    primary.push({
      id: 'catalog',
      label: 'Catalog',
      route: 'admin.catalog',
      featureFlag: 'modules.catalog',
    });
  }
  admin.primary = primary;
  navigation.admin = admin;
  next.navigation = navigation;

  return next;
}
