/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Design tokens compiled by the Theme Engine into CSS, React Native, and Admin theme bundles.
 */
export interface Theme {
  /**
   * Base template family selected for the tenant.
   */
  preset: 'default' | 'minimal' | 'modern' | 'luxury' | 'dark' | 'custom';
  /**
   * Theme versioning and compilation metadata.
   */
  metadata?: {
    /**
     * Incremented when tenant theme configuration changes.
     */
    themeVersion?: number;
    /**
     * ISO 8601 timestamp when the theme was first created.
     */
    createdAt?: string;
    /**
     * ISO 8601 timestamp when the theme was last modified.
     */
    updatedAt?: string;
    /**
     * ISO 8601 timestamp when the Theme Engine last resolved tokens.
     */
    compiledAt?: string;
    /**
     * SHA-256 hash of the canonical resolved theme token payload.
     */
    hash?: string;
  };
  colors: {
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    primary: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    secondary: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    background: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    surface: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    text: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    textMuted?: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    border?: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    error: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    success: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    warning: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    scale: 'compact' | 'default' | 'comfortable';
    baseFontSize?: number;
  };
  spacing: {
    /**
     * Base spacing grid unit in pixels.
     */
    unit: 4 | 8;
    density?: 'compact' | 'default' | 'spacious';
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full?: number;
  };
  elevation?: 'flat' | 'subtle' | 'raised';
  motion?: {
    enabled?: boolean;
    durationMs?: number;
  };
  componentVariants?: {
    button?: 'filled' | 'outline' | 'ghost';
    input?: 'outline' | 'filled' | 'underline';
    card?: 'elevated' | 'outlined' | 'flat';
  };
  darkMode?: {
    enabled?: boolean;
    strategy?: 'manual' | 'system' | 'scheduled';
    colors?: {
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      primary?: string;
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      background?: string;
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      surface?: string;
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      text?: string;
    };
  };
}
