import type { ResolvedAdminDashboardShell, ResolvedAdminNavItem } from '../types.js';
import type { AdminScreenDefinition, AdminScreenRegistry } from './admin-screen-registry.js';

/** View-model for the React admin shell layout (framework-agnostic data). */
export interface AdminShellViewModel {
  shell: ResolvedAdminDashboardShell;
  activeRoute: string;
  activeScreen: AdminScreenDefinition;
  /** Flat primary nav for sidebar rendering. */
  primaryNav: readonly ResolvedAdminNavItem[];
  /** Widgets enabled for the active screen (intersection with shell widgets). */
  activeWidgets: readonly { id: string; position: number }[];
}

/**
 * Build a layout view-model from a resolved shell + screen registry.
 */
export function buildAdminShellViewModel(
  shell: ResolvedAdminDashboardShell,
  registry: AdminScreenRegistry,
  activeRoute?: string,
): AdminShellViewModel {
  const activeScreen = registry.resolveActiveScreen(shell, activeRoute);
  const widgetIdSet = new Set(activeScreen.widgetIds ?? []);
  const activeWidgets =
    widgetIdSet.size === 0
      ? []
      : shell.widgets
          .filter((widget) => widgetIdSet.has(widget.id))
          .map((widget) => ({ id: widget.id, position: widget.position }));

  return {
    shell,
    activeRoute: activeScreen.route,
    activeScreen,
    primaryNav: shell.navigation.primary,
    activeWidgets,
  };
}
