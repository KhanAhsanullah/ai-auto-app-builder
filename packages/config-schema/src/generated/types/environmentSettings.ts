/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Environment-specific overrides and deployment target configuration.
 */
export interface EnvironmentSettings {
  /**
   * Active environment for this configuration document.
   */
  current: 'development' | 'staging' | 'production';
  targets: {
    development: EnvironmentTarget;
    staging: EnvironmentTarget;
    production: EnvironmentTarget;
  };
  /**
   * Partial config overrides applied per environment at resolution time.
   */
  overrides?: {
    development?: EnvironmentOverrides;
    staging?: EnvironmentOverrides;
    production?: EnvironmentOverrides;
  };
  promotionPolicy?: {
    requireApproval?: boolean;
    allowedPaths?: ('development->staging' | 'staging->production')[];
    runValidationOnPromote?: boolean;
  };
}
/**
 * This interface was referenced by `EnvironmentSettings`'s JSON-Schema
 * via the `definition` "environmentTarget".
 */
export interface EnvironmentTarget {
  apiBaseUrl: string;
  cdnBaseUrl?: string;
  debug?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Shallow override keys matching top-level tenant config sections.
 *
 * This interface was referenced by `EnvironmentSettings`'s JSON-Schema
 * via the `definition` "environmentOverrides".
 */
export interface EnvironmentOverrides {
  payments?: {
    defaultGateway?: string;
  };
  integrations?: {};
  aiSettings?: {};
  [k: string]: unknown;
}
