import type { Branding } from '@ai-commerce/config-schema';

import type { ResolvedWebBranding } from '../types.js';

/**
 * Maps tenant branding (+ optional company display name) into a web storefront brand slice.
 */
export class WebBrandingResolver {
  resolve(branding: Branding, companyDisplayName?: string): ResolvedWebBranding {
    return {
      appName: branding.appName,
      tagline: branding.tagline,
      displayName: companyDisplayName?.trim() || branding.appName,
      logoPrimary: branding.logo?.primary,
      logoInverse: branding.logo?.inverse,
      favicon: branding.logo?.favicon,
      appleTouchIcon: branding.logo?.appleTouchIcon,
      ogImageUrl: branding.socialShare?.ogImageUrl,
      twitterHandle: branding.socialShare?.twitterHandle,
      copyrightText: branding.copyrightText,
      showPoweredBy: branding.showPoweredBy ?? false,
    };
  }
}
