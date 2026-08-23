import { AdminDashboardResolutionException } from '../errors.js';
import type {
  ResolveAdminDashboardShellInput,
  ResolvedAdminDashboardShell,
  ResolvedAdminWidget,
} from '../types.js';
import { AdminBrandingResolver } from './admin-branding-resolver.js';
import { AdminNavigationResolver } from './admin-navigation-resolver.js';
import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';

export interface AdminDashboardShellResolverDeps {
  brandingResolver?: AdminBrandingResolver;
}

/**
 * Builds the config-driven admin dashboard shell model:
 * navigation (flag-gated), branding, layout, widgets, preferences.
 */
export class AdminDashboardShellResolver {
  private readonly brandingResolver: AdminBrandingResolver;

  constructor(deps: AdminDashboardShellResolverDeps = {}) {
    this.brandingResolver = deps.brandingResolver ?? new AdminBrandingResolver();
  }

  resolve(input: ResolveAdminDashboardShellInput): ResolvedAdminDashboardShell {
    const settings = input.adminDashboard;
    if (!settings.enabled) {
      throw new AdminDashboardResolutionException(
        `Admin dashboard is disabled for tenant '${input.tenant.slug}'.`,
      );
    }

    const flags = new FeatureFlagEvaluator(input.featureFlags);
    const navigation = new AdminNavigationResolver(flags).resolve(input.navigationAdmin);
    const branding = this.brandingResolver.resolve(input.branding, input.companyDisplayName);
    const widgets = resolveWidgets(settings, input.roles);

    if (navigation.primary.length === 0) {
      throw new AdminDashboardResolutionException(
        'Admin navigation primary menu resolved to zero visible items.',
      );
    }

    return {
      enabled: true,
      tenant: {
        id: input.tenant.id,
        slug: input.tenant.slug,
        name: input.tenant.name,
        vertical: input.tenant.vertical,
      },
      branding,
      navigation,
      layout: {
        sidebarStyle: settings.layout.sidebarStyle,
        defaultLandingRoute: settings.layout.defaultLandingRoute,
      },
      preferences: settings.preferences,
      widgets,
      featureFlags: input.featureFlags,
      ...(settings.domain ? { domain: settings.domain } : {}),
      ...(settings.onboarding ? { onboarding: settings.onboarding } : {}),
    };
  }
}

function resolveWidgets(
  settings: ResolveAdminDashboardShellInput['adminDashboard'],
  roles: readonly string[] | undefined,
): ResolvedAdminWidget[] {
  const roleSet = new Set((roles ?? []).map((role) => role.toLowerCase()));
  const widgets = settings.layout.widgets ?? [];

  return widgets
    .filter((widget) => widget.enabled)
    .filter((widget) => {
      if (!widget.requiredRole) {
        return true;
      }
      return roleSet.has(widget.requiredRole.toLowerCase());
    })
    .map((widget) => ({
      id: widget.id,
      position: widget.position ?? 0,
      ...(widget.requiredRole ? { requiredRole: widget.requiredRole } : {}),
    }))
    .sort((a, b) => a.position - b.position);
}
