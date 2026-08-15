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
    /**
     * Preferred mobile app icon source URL.
     */
    appIcon?: string;
  };
  /**
   * Optional brand font asset references (not theme typography tokens).
   */
  fonts?: {
    heading?: FontAsset;
    body?: FontAsset;
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
 * This interface was referenced by `Branding`'s JSON-Schema
 * via the `definition` "fontAsset".
 */
export interface FontAsset {
  url: string;
  format?: 'woff2' | 'woff' | 'ttf' | 'otf';
  weight?: number;
  style?: 'normal' | 'italic';
}
/**
 * Arbitrary key-value metadata for integrations and extensions.
 */
export interface Metadata {
  [k: string]: string | number | boolean | null;
}
