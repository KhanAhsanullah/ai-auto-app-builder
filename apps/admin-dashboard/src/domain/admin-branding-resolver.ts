import type { Branding } from '@ai-commerce/config-schema';

import type { ResolvedAdminBranding } from '../types.js';

/**
 * Maps tenant branding (+ optional company display name) into an admin shell brand slice.
 */
export class AdminBrandingResolver {
  resolve(branding: Branding, companyDisplayName?: string): ResolvedAdminBranding {
    return {
      appName: branding.appName,
      tagline: branding.tagline,
      displayName: companyDisplayName?.trim() || branding.appName,
      logoPrimary: branding.logo?.primary,
      logoInverse: branding.logo?.inverse,
      favicon: branding.logo?.favicon,
      showPoweredBy: branding.showPoweredBy ?? false,
    };
  }
}
