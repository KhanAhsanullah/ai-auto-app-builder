import { MobileAppResolutionException } from '../errors.js';
import type { ResolveMobileAppShellInput, ResolvedMobileAppShell } from '../types.js';
import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { MobileBrandingResolver } from './mobile-branding-resolver.js';
import { MobileNavigationResolver } from './mobile-navigation-resolver.js';

export interface MobileAppShellResolverDeps {
  brandingResolver?: MobileBrandingResolver;
}

/**
 * Builds the config-driven mobile app shell model:
 * navigation (flag-gated), branding, identity, runtime, landing route.
 */
export class MobileAppShellResolver {
  private readonly brandingResolver: MobileBrandingResolver;

  constructor(deps: MobileAppShellResolverDeps = {}) {
    this.brandingResolver = deps.brandingResolver ?? new MobileBrandingResolver();
  }

  resolve(input: ResolveMobileAppShellInput): ResolvedMobileAppShell {
    const settings = input.mobileApp;
    if (!settings.enabled) {
      throw new MobileAppResolutionException(
        `Mobile app is disabled for tenant '${input.tenant.slug}'.`,
      );
    }

    const flags = new FeatureFlagEvaluator(input.featureFlags);
    const navigation = new MobileNavigationResolver(flags).resolve(input.navigationMobile);
    const branding = this.brandingResolver.resolve(input.branding, input.companyDisplayName);

    if (navigation.primary.length === 0) {
      throw new MobileAppResolutionException(
        'Mobile navigation primary menu resolved to zero visible items.',
      );
    }

    const first = navigation.primary[0];
    if (!first) {
      throw new MobileAppResolutionException(
        'Mobile navigation primary menu resolved to zero visible items.',
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
      identity: settings.identity,
      runtime: settings.runtime,
      ...(settings.storeListing ? { storeListing: settings.storeListing } : {}),
      defaultLandingRoute: first.route,
      featureFlags: input.featureFlags,
    };
  }
}
