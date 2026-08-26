import type { ResolvedWebNavItem, ResolvedWebStoreShell } from '../types.js';
import type { WebScreenDefinition, WebScreenRegistry } from './web-screen-registry.js';

/** View-model for the React web storefront shell layout. */
export interface WebShellViewModel {
  shell: ResolvedWebStoreShell;
  activeRoute: string;
  activeScreen: WebScreenDefinition;
  primaryNav: readonly ResolvedWebNavItem[];
  secondaryNav: readonly ResolvedWebNavItem[];
  footerNav: readonly ResolvedWebNavItem[];
}

/**
 * Build a layout view-model from a resolved shell + screen registry.
 */
export function buildWebShellViewModel(
  shell: ResolvedWebStoreShell,
  registry: WebScreenRegistry,
  activeRoute?: string,
): WebShellViewModel {
  const activeScreen = registry.resolveActiveScreen(shell, activeRoute);

  return {
    shell,
    activeRoute: activeScreen.route,
    activeScreen,
    primaryNav: shell.navigation.primary,
    secondaryNav: shell.navigation.secondary,
    footerNav: shell.navigation.footer,
  };
}
