/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Root tenant identity and operational settings. All platform data scopes from the tenant.
 */
export interface Tenant {
  /**
   * RFC 4122 UUID identifier.
   */
  id: string;
  /**
   * URL-safe lowercase slug.
   */
  slug: string;
  name: string;
  /**
   * Active business vertical pack for this tenant.
   */
  vertical: 'ecommerce' | 'grocery' | 'restaurant' | 'pharmacy' | 'fashion' | 'electronics';
  /**
   * Tenant lifecycle status.
   */
  status: 'draft' | 'active' | 'suspended' | 'archived';
  /**
   * BCP 47 language tag (e.g. en, en-US, ur-PK).
   */
  defaultLocale: string;
  /**
   * IANA timezone identifier (e.g. Asia/Karachi).
   */
  defaultTimezone: string;
  /**
   * ISO 3166-1 alpha-2 country code.
   */
  defaultCountry?: string;
  subscriptionTier?: 'starter' | 'growth' | 'enterprise';
  /**
   * @minItems 1
   */
  stores?: [
    {
      /**
       * RFC 4122 UUID identifier.
       */
      id: string;
      /**
       * URL-safe lowercase slug.
       */
      slug: string;
      name: string;
      isDefault?: boolean;
      /**
       * @minItems 1
       */
      channels?: ['web' | 'mobile' | 'admin' | 'api', ...('web' | 'mobile' | 'admin' | 'api')[]];
    },
    ...{
      /**
       * RFC 4122 UUID identifier.
       */
      id: string;
      /**
       * URL-safe lowercase slug.
       */
      slug: string;
      name: string;
      isDefault?: boolean;
      /**
       * @minItems 1
       */
      channels?: ['web' | 'mobile' | 'admin' | 'api', ...('web' | 'mobile' | 'admin' | 'api')[]];
    }[],
  ];
  metadata?: Metadata;
}
/**
 * Arbitrary key-value metadata for integrations and extensions.
 */
export interface Metadata {
  [k: string]: string | number | boolean | null;
}
