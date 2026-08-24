import type { Branding } from '@ai-commerce/config-schema';

import type { ResolvedMobileBranding } from '../types.js';

/**
 * Maps tenant branding (+ optional company display name) into a mobile shell brand slice.
 */
export class MobileBrandingResolver {
  resolve(branding: Branding, companyDisplayName?: string): ResolvedMobileBranding {
    return {
      appName: branding.appName,
      tagline: branding.tagline,
      displayName: companyDisplayName?.trim() || branding.appName,
      logoPrimary: branding.logo?.primary,
      logoInverse: branding.logo?.inverse,
      appIcon: branding.logo?.appIcon,
      splashBackgroundColor: branding.splashScreen?.backgroundColor,
      splashImageUrl: branding.splashScreen?.imageUrl,
      showPoweredBy: branding.showPoweredBy ?? false,
    };
  }
}
