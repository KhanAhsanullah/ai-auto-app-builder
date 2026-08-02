/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Brand identity assets and copy used across all generated surfaces.
 */
export interface Branding {
  /**
   * Application display name shown to end customers.
   */
  appName: string;
  tagline: string;
  logo?: {
    /**
     * Primary logo URL (light background).
     */
    primary?: string;
    /**
     * Logo for dark backgrounds.
     */
    inverse?: string;
    favicon?: string;
    appleTouchIcon?: string;
  };
  splashScreen?: {
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    backgroundColor?: string;
    imageUrl?: string;
  };
  socialShare?: {
    ogImageUrl?: string;
    twitterHandle?: string;
  };
  /**
   * Display platform attribution (tier-dependent).
   */
  showPoweredBy?: boolean;
  copyrightText?: string;
  metadata?: Metadata;
}
/**
 * Arbitrary key-value metadata for integrations and extensions.
 */
export interface Metadata {
  [k: string]: string | number | boolean | null;
}
