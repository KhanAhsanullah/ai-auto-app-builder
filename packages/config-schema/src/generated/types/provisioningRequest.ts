/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Input contract for creating a new tenant via the Tenant Provisioner.
 */
export interface ProvisioningRequest {
  /**
   * Optional tenant UUID. Generated when omitted.
   */
  id?: string;
  /**
   * URL-safe lowercase slug.
   */
  slug: string;
  name: string;
  vertical: 'ecommerce' | 'grocery' | 'restaurant' | 'pharmacy' | 'fashion' | 'electronics';
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
  configOverrides?: ConfigOverrides;
}
/**
 * Partial tenant-layer configuration overrides merged after base template construction. Does not replace platform or vertical defaults.
 *
 * This interface was referenced by `ProvisioningRequest`'s JSON-Schema
 * via the `definition` "configOverrides".
 */
export interface ConfigOverrides {
  /**
   * Partial company section override.
   */
  company?: {};
  /**
   * Partial branding section override.
   */
  branding?: {};
  /**
   * Partial theme section override.
   */
  theme?: {};
  /**
   * Partial navigation section override.
   */
  navigation?: {};
  /**
   * Partial languages section override.
   */
  languages?: {};
  /**
   * Partial currency section override.
   */
  currency?: {};
  /**
   * Partial feature flags section override.
   */
  featureFlags?: {};
  /**
   * Partial authentication section override.
   */
  authentication?: {};
  /**
   * Partial payments section override.
   */
  payments?: {};
  /**
   * Partial notifications section override.
   */
  notifications?: {};
  /**
   * Partial integrations section override.
   */
  integrations?: {};
  /**
   * Partial AI settings section override.
   */
  aiSettings?: {};
  /**
   * Partial mobile app settings section override.
   */
  mobileApp?: {};
  /**
   * Partial web store settings section override.
   */
  webStore?: {};
  /**
   * Partial admin dashboard settings section override.
   */
  adminDashboard?: {};
}
