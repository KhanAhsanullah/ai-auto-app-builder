export { buildMobileShellViewModel } from './domain/build-mobile-shell-view-model.js';
export type { MobileShellViewModel } from './domain/build-mobile-shell-view-model.js';
export { FeatureFlagEvaluator } from './domain/feature-flag-evaluator.js';
export {
  toResolveMobileAppShellInput,
  type MobileAppConfigSource,
} from './domain/map-config-provider-result.js';
export { MobileAppShellResolver } from './domain/mobile-app-shell-resolver.js';
export type { MobileAppShellResolverDeps } from './domain/mobile-app-shell-resolver.js';
export { MobileBrandingResolver } from './domain/mobile-branding-resolver.js';
export { MobileNavigationResolver } from './domain/mobile-navigation-resolver.js';
export type { ResolveMobileNavigationInput } from './domain/mobile-navigation-resolver.js';
export {
  MobileScreenRegistry,
  createDefaultMobileScreenRegistry,
  createDefaultMobileScreens,
} from './domain/mobile-screen-registry.js';
export type { MobileScreenDefinition } from './domain/mobile-screen-registry.js';
export { MobileAppException, MobileAppResolutionException } from './errors.js';
export type {
  MobileNavItem,
  MobileNavStyle,
  ResolveMobileAppShellInput,
  ResolvedMobileAppShell,
  ResolvedMobileBranding,
  ResolvedMobileNavItem,
  ResolvedMobileNavigation,
} from './types.js';
