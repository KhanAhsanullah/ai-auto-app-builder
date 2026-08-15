import type { Branding } from '@ai-commerce/config-schema';
import { brandingSchema } from '@ai-commerce/config-schema';

import { BRAND_PLATFORM_DEFAULTS } from '../defaults/platform-brand.js';
import { getVerticalBrandDefaults } from '../defaults/vertical-brands.js';
import { BrandResolutionException } from '../errors.js';
import type {
  BrandHashPayload,
  BrandLayers,
  BrandMetadata,
  BrandPatch,
  ResolveBrandInput,
  ResolvedBrandResult,
} from '../types.js';
import { computeBrandHash } from '../utils/brand-hash.js';
import { deepMerge, shallowMergeBrandSections } from '../utils/deep-merge.js';

/** Resolves branding configuration through the inheritance chain. */
export class BrandResolver {
  /** Resolve branding from layered configuration input. */
  resolve(input: ResolveBrandInput): ResolvedBrandResult {
    const platformLayer = input.platformDefaults ?? BRAND_PLATFORM_DEFAULTS;
    const verticalLayer =
      input.verticalDefaults ??
      (input.vertical !== undefined ? getVerticalBrandDefaults(input.vertical) : {});
    const tenantLayer = input.tenantBranding ?? {};
    const environmentLayer = input.environmentBranding ?? {};

    let merged: BrandPatch = deepMerge({}, platformLayer);
    merged = deepMerge(merged, verticalLayer);
    merged = deepMerge(merged, tenantLayer);

    if (Object.keys(environmentLayer).length > 0) {
      merged = shallowMergeBrandSections(merged, environmentLayer);
    }

    const validation = brandingSchema.safeParse(merged);
    if (!validation.success) {
      throw new BrandResolutionException(
        `Resolved branding failed schema validation: ${validation.error.message}`,
      );
    }

    const branding = validation.data as Branding;
    const metadata = this.buildMetadata(branding);
    const layers: BrandLayers = {
      platform: platformLayer,
      vertical: verticalLayer,
      tenant: tenantLayer,
      environment: environmentLayer,
    };

    return {
      branding,
      metadata,
      layers,
      tenantId: input.tenantId,
      vertical: input.vertical,
      environment: input.environment,
    };
  }

  private buildMetadata(branding: Branding): BrandMetadata {
    const hashPayload: BrandHashPayload = {
      appName: branding.appName,
      tagline: branding.tagline,
      logo: branding.logo,
      fonts: branding.fonts,
      splashScreen: branding.splashScreen,
      socialShare: branding.socialShare,
      showPoweredBy: branding.showPoweredBy,
      copyrightText: branding.copyrightText,
    };

    const brandVersionRaw = branding.metadata?.brandVersion;

    return {
      brandVersion: typeof brandVersionRaw === 'number' ? brandVersionRaw : 0,
      compiledAt: new Date().toISOString(),
      hash: computeBrandHash(hashPayload),
    };
  }
}
