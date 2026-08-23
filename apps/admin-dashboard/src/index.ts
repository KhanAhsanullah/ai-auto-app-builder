export { AdminBrandingResolver } from './domain/admin-branding-resolver.js';
export { AdminDashboardShellResolver } from './domain/admin-dashboard-shell-resolver.js';
export type { AdminDashboardShellResolverDeps } from './domain/admin-dashboard-shell-resolver.js';
export { AdminNavigationResolver } from './domain/admin-navigation-resolver.js';
export type { ResolveAdminNavigationInput } from './domain/admin-navigation-resolver.js';
export {
  AdminScreenRegistry,
  createDefaultAdminScreenRegistry,
  createDefaultAdminScreens,
} from './domain/admin-screen-registry.js';
export type { AdminScreenDefinition } from './domain/admin-screen-registry.js';
export { buildAdminShellViewModel } from './domain/build-admin-shell-view-model.js';
export type { AdminShellViewModel } from './domain/build-admin-shell-view-model.js';
export { FeatureFlagEvaluator } from './domain/feature-flag-evaluator.js';
export {
  toResolveAdminDashboardShellInput,
  type AdminDashboardConfigSource,
} from './domain/map-config-provider-result.js';
export { AdminDashboardException, AdminDashboardResolutionException } from './errors.js';
export type {
  AdminNavItem,
  AdminNavStyle,
  ResolveAdminDashboardShellInput,
  ResolvedAdminBranding,
  ResolvedAdminDashboardShell,
  ResolvedAdminNavItem,
  ResolvedAdminNavigation,
  ResolvedAdminWidget,
} from './types.js';
