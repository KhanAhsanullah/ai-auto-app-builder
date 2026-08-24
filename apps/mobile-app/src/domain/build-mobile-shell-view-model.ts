import type { ResolvedMobileAppShell, ResolvedMobileNavItem } from '../types.js';
import type { MobileScreenDefinition, MobileScreenRegistry } from './mobile-screen-registry.js';

/** View-model for the React Native mobile shell layout. */
export interface MobileShellViewModel {
  shell: ResolvedMobileAppShell;
  activeRoute: string;
  activeScreen: MobileScreenDefinition;
  /** Primary nav items for the bottom bar. */
  tabItems: readonly ResolvedMobileNavItem[];
}

/**
 * Build a layout view-model from a resolved shell + screen registry.
 */
export function buildMobileShellViewModel(
  shell: ResolvedMobileAppShell,
  registry: MobileScreenRegistry,
  activeRoute?: string,
): MobileShellViewModel {
  const activeScreen = registry.resolveActiveScreen(shell, activeRoute);

  return {
    shell,
    activeRoute: activeScreen.route,
    activeScreen,
    tabItems: shell.navigation.primary,
  };
}
