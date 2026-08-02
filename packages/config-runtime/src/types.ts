import type { EnvironmentSettings, Tenant, TenantConfiguration } from '@ai-commerce/config-schema';

/** Recursive partial for configuration layer inputs. */
export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** A single layer in the configuration inheritance chain. */
export type ConfigLayerSource = 'platform' | 'vertical' | 'tenant' | 'environment';

/** Partial configuration contributed by one inheritance layer. */
export type ConfigLayer = DeepPartial<TenantConfiguration>;

/** Resolved layer snapshots retained for debugging and audit. */
export interface ResolvedLayers {
  platform: ConfigLayer;
  vertical: ConfigLayer;
  tenant: ConfigLayer;
  environment: ConfigLayer;
}

/** Input for the configuration resolver. */
export interface ResolveConfigInput {
  /** Platform-wide defaults. Falls back to built-in defaults when omitted. */
  platformDefaults?: ConfigLayer;
  /** Vertical preset overrides. Resolved from `tenant.vertical` when omitted. */
  verticalDefaults?: ConfigLayer;
  /** Tenant-specific configuration document or partial override. */
  tenantConfig: ConfigLayer;
  /** Active environment. Falls back to `tenantConfig.environment.current`. */
  environment?: EnvironmentSettings['current'];
}

/** Successful resolution result with immutable configuration. */
export interface ResolvedConfig {
  config: Readonly<TenantConfiguration>;
  layers: ResolvedLayers;
  environment: EnvironmentSettings['current'];
  vertical: Tenant['vertical'];
}

/** Validation outcome from Zod parsing. */
export interface ValidationResult {
  success: boolean;
  config?: TenantConfiguration;
  errors: ConfigValidationError[];
}

/** Human-readable validation error. */
export interface ConfigValidationError {
  path: string;
  message: string;
  code: string;
}

/** Options for JSON configuration loading. */
export interface LoadConfigOptions {
  /** When true, reject non-object JSON roots. Default: true. */
  requireObject?: boolean;
}

/** Cache entry metadata. */
export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt?: number;
}

/** Options for the in-memory configuration cache. */
export interface ConfigCacheOptions {
  /** Time-to-live in milliseconds. Omit for no expiration. */
  ttlMs?: number;
  /** Maximum number of entries before LRU eviction. Default: 100. */
  maxEntries?: number;
}

/** Provider initialization options. */
export interface ConfigProviderOptions {
  platformDefaults?: ConfigLayer;
  verticalDefaults?: Record<Tenant['vertical'], ConfigLayer>;
  cache?: ConfigCacheOptions | false;
  /** Validate resolved configuration. Default: true. */
  validate?: boolean;
}

/** Result of loading and resolving configuration through the provider. */
export interface ConfigProviderResult {
  config: Readonly<TenantConfiguration>;
  layers: ResolvedLayers;
  environment: EnvironmentSettings['current'];
  vertical: Tenant['vertical'];
  validation: ValidationResult;
  fromCache: boolean;
}
