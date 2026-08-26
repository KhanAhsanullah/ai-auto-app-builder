import { WebStoreResolutionException } from '../errors.js';
import type { ResolveWebStoreShellInput, ResolvedWebStoreShell } from '../types.js';
import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { WebBrandingResolver } from './web-branding-resolver.js';
import { WebNavigationResolver } from './web-navigation-resolver.js';

export interface WebStoreShellResolverDeps {
  brandingResolver?: WebBrandingResolver;
}

/**
 * Builds the config-driven web store shell model:
 * navigation (flag-gated), branding, domain, SEO, rendering, landing route.
 */
export class WebStoreShellResolver {
  private readonly brandingResolver: WebBrandingResolver;

  constructor(deps: WebStoreShellResolverDeps = {}) {
    this.brandingResolver = deps.brandingResolver ?? new WebBrandingResolver();
  }

  resolve(input: ResolveWebStoreShellInput): ResolvedWebStoreShell {
    const settings = input.webStore;
    if (!settings.enabled) {
      throw new WebStoreResolutionException(
        `Web store is disabled for tenant '${input.tenant.slug}'.`,
      );
    }

    const flags = new FeatureFlagEvaluator(input.featureFlags);
    const navigation = new WebNavigationResolver(flags).resolve(input.navigationWeb);
    const branding = this.brandingResolver.resolve(input.branding, input.companyDisplayName);

    if (navigation.primary.length === 0) {
      throw new WebStoreResolutionException(
        'Web navigation primary menu resolved to zero visible items.',
      );
    }

    const first = navigation.primary[0];
    if (!first) {
      throw new WebStoreResolutionException(
        'Web navigation primary menu resolved to zero visible items.',
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
      domain: settings.domain,
      seo: settings.seo,
      rendering: settings.rendering,
      ...(settings.pwa ? { pwa: settings.pwa } : {}),
      ...(settings.legal ? { legal: settings.legal } : {}),
      defaultLandingRoute: first.route,
      featureFlags: input.featureFlags,
    };
  }
}
