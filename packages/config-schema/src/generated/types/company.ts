/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Legal and business entity information for the merchant operating the tenant.
 */
export interface Company {
  /**
   * Registered legal business name.
   */
  legalName: string;
  /**
   * Public-facing business name.
   */
  displayName: string;
  /**
   * Business registration or tax ID.
   */
  registrationNumber?: string;
  contactEmail: string;
  /**
   * E.164 international phone number.
   */
  contactPhone?: string;
  website?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    /**
     * ISO 3166-1 alpha-2 country code.
     */
    country: string;
  };
  /**
   * Human-readable support availability (e.g. 'Mon–Fri 9am–6pm PKT').
   */
  supportHours?: string;
  metadata?: Metadata;
}
/**
 * Arbitrary key-value metadata for integrations and extensions.
 */
export interface Metadata {
  [k: string]: string | number | boolean | null;
}
