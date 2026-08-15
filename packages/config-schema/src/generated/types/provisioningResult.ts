/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Summary outcome of a tenant provisioning or activation operation.
 */
export interface ProvisioningResult {
  /**
   * RFC 4122 UUID identifier.
   */
  tenantId: string;
  /**
   * URL-safe lowercase slug.
   */
  slug: string;
  name: string;
  vertical: 'ecommerce' | 'grocery' | 'restaurant' | 'pharmacy' | 'fashion' | 'electronics';
  /**
   * Tenant lifecycle status after the operation.
   */
  status: 'draft' | 'active';
  /**
   * Tenant configuration document version from meta.configVersion.
   */
  configVersion: number;
  /**
   * SHA-256 fingerprint of the canonical provisioning input.
   */
  requestFingerprint: string;
  /**
   * True when a new registry record was created; false on idempotent replay or activation.
   */
  created: boolean;
  /**
   * ISO 8601 date-time in UTC.
   */
  createdAt: string;
  /**
   * ISO 8601 date-time in UTC.
   */
  updatedAt: string;
}
