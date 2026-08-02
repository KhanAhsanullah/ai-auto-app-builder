/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Locale and internationalization settings for the tenant.
 */
export interface Languages {
  /**
   * BCP 47 language tag (e.g. en, en-US, ur-PK).
   */
  default: string;
  /**
   * @minItems 1
   */
  supported: [string, ...string[]];
  /**
   * BCP 47 language tag (e.g. en, en-US, ur-PK).
   */
  fallback: string;
  /**
   * Locales rendered right-to-left (e.g. ar, ur).
   */
  rtlLocales?: string[];
  /**
   * Detect user locale from browser/device settings.
   */
  autoDetect?: boolean;
  /**
   * Allow end users to switch language in the app.
   */
  allowUserOverride?: boolean;
}
