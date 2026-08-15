/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Registration contract for third-party plugins in the platform plugin catalog.
 */
export interface PluginManifest {
  /**
   * Reverse-DNS plugin identifier.
   */
  id: string;
  name: string;
  description: string;
  /**
   * Exact plugin release version (catalog key).
   */
  version: string;
  /**
   * Platform API compatibility semver range.
   */
  engineVersion: string;
  /**
   * @minItems 0
   */
  permissions: string[];
  hooks: HookRegistration[];
  dependencies?: PluginDependency[];
  /**
   * Embedded JSON Schema describing allowed plugin settings.
   */
  configSchema?: {};
}
/**
 * This interface was referenced by `PluginManifest`'s JSON-Schema
 * via the `definition` "hookRegistration".
 */
export interface HookRegistration {
  /**
   * Known hook point identifier validated against the platform catalog.
   */
  point: string;
  /**
   * Logical handler identifier for in-process registration.
   */
  handler: string;
  priority?: number;
}
/**
 * This interface was referenced by `PluginManifest`'s JSON-Schema
 * via the `definition` "pluginDependency".
 */
export interface PluginDependency {
  id: string;
  /**
   * Semver range for the required plugin version.
   */
  versionRange: string;
}
