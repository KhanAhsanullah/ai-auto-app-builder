/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Web storefront domain, SEO, PWA, and rendering configuration.
 */
export interface WebStoreSettings {
  enabled: boolean;
  domain: {
    /**
     * Primary custom domain (e.g. shop.merchant.com).
     */
    primary: string;
    aliases?: string[];
    /**
     * Platform-provided subdomain for starter tier.
     */
    platformSubdomain?: string;
    ssl?: {
      autoProvision?: boolean;
      forceHttps?: boolean;
    };
  };
  seo: {
    title: string;
    description: string;
    /**
     * @maxItems 20
     */
    keywords?:
      | []
      | [string]
      | [string, string]
      | [string, string, string]
      | [string, string, string, string]
      | [string, string, string, string, string]
      | [string, string, string, string, string, string]
      | [string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string, string, string]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ];
    robotsIndex?: boolean;
    sitemapEnabled?: boolean;
    structuredData?: {
      organization?: boolean;
      product?: boolean;
      breadcrumb?: boolean;
    };
  };
  pwa?: {
    enabled?: boolean;
    displayMode?: 'standalone' | 'minimal-ui' | 'browser';
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    themeColor?: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    backgroundColor?: string;
  };
  rendering: {
    mode: 'ssr' | 'ssg' | 'isr' | 'spa';
    cacheTtlSeconds?: number;
  };
  legal?: {
    termsOfServiceUrl?: string;
    privacyPolicyUrl?: string;
    refundPolicyUrl?: string;
    cookieConsent?: {
      enabled?: boolean;
      regions?: string[];
    };
  };
}
