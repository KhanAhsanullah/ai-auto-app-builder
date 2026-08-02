import type { Tenant } from '@ai-commerce/config-schema';

import { ConfigCache } from './config-cache.js';
import { ConfigLoader } from './config-loader.js';
import { ConfigResolver } from './config-resolver.js';
import { ConfigValidator } from './config-validator.js';
import { deepFreeze } from './deep-merge.js';
import { ConfigValidationException } from './errors.js';
import type {
  ConfigLayer,
  ConfigProviderOptions,
  ConfigProviderResult,
  ResolveConfigInput,
  ValidationResult,
} from './types.js';

interface CachedProviderResult {
  config: ConfigProviderResult['config'];
  layers: ConfigProviderResult['layers'];
  environment: ConfigProviderResult['environment'];
  vertical: ConfigProviderResult['vertical'];
  validation: ValidationResult;
}

/** Facade for loading, resolving, validating, and caching tenant configuration. */
export class ConfigProvider {
  readonly loader: ConfigLoader;
  readonly resolver: ConfigResolver;
  readonly validator: ConfigValidator;

  private readonly cache: ConfigCache | null;
  private readonly platformDefaults?: ConfigLayer;
  private readonly verticalDefaults?: Partial<Record<Tenant['vertical'], ConfigLayer>>;
  private readonly shouldValidate: boolean;

  constructor(options: ConfigProviderOptions = {}) {
    this.loader = new ConfigLoader();
    this.resolver = new ConfigResolver();
    this.validator = new ConfigValidator();
    this.platformDefaults = options.platformDefaults;
    this.verticalDefaults = options.verticalDefaults;
    this.shouldValidate = options.validate !== false;
    this.cache = options.cache === false ? null : new ConfigCache(options.cache);
  }

  /** Resolve tenant configuration through the full inheritance chain. */
  resolve(
    input: ResolveConfigInput & { cacheKey?: string; skipCache?: boolean },
  ): ConfigProviderResult {
    const cacheKey = input.cacheKey ?? this.buildCacheKey(input);

    if (this.cache && !input.skipCache) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }
    }

    const vertical = input.tenantConfig.tenant?.vertical;
    const verticalDefaults =
      input.verticalDefaults ??
      (vertical !== undefined ? this.verticalDefaults?.[vertical] : undefined);

    const resolved = this.resolver.resolve({
      platformDefaults: input.platformDefaults ?? this.platformDefaults,
      verticalDefaults,
      tenantConfig: input.tenantConfig,
      environment: input.environment,
    });

    const validation = this.validator.validate(resolved.config);

    if (this.shouldValidate && !validation.success) {
      throw new ConfigValidationException(validation.errors);
    }

    const config =
      validation.success && validation.config ? deepFreeze(validation.config) : resolved.config;

    const result: CachedProviderResult = {
      config,
      layers: resolved.layers,
      environment: resolved.environment,
      vertical: resolved.vertical,
      validation,
    };

    if (this.cache) {
      this.cache.set(cacheKey, config);
    }

    return { ...result, fromCache: false };
  }

  /** Load tenant configuration from a JSON file and resolve it. */
  async loadFromFile(
    filePath: string,
    options?: Omit<ResolveConfigInput, 'tenantConfig'> & {
      cacheKey?: string;
      skipCache?: boolean;
    },
  ): Promise<ConfigProviderResult> {
    const tenantConfig = await this.loader.loadFromFile<ConfigLayer>(filePath);
    return this.resolve({ ...options, tenantConfig });
  }

  /** Load tenant configuration from a JSON file synchronously and resolve it. */
  loadFromFileSync(
    filePath: string,
    options?: Omit<ResolveConfigInput, 'tenantConfig'> & {
      cacheKey?: string;
      skipCache?: boolean;
    },
  ): ConfigProviderResult {
    const tenantConfig = this.loader.loadFromFileSync<ConfigLayer>(filePath);
    return this.resolve({ ...options, tenantConfig });
  }

  /** Retrieve a cached resolved configuration by key, if available. */
  getCached(key: string): ConfigProviderResult['config'] | undefined {
    return this.cache?.get(key);
  }

  /** Clear all cached configurations. */
  clearCache(): void {
    this.cache?.clear();
  }

  private getCachedResult(cacheKey: string): CachedProviderResult | undefined {
    const cachedConfig = this.cache?.get(cacheKey);
    if (!cachedConfig) {
      return undefined;
    }

    return {
      config: cachedConfig,
      layers: {
        platform: {},
        vertical: {},
        tenant: {},
        environment: {},
      },
      environment: cachedConfig.environment.current,
      vertical: cachedConfig.tenant.vertical,
      validation: { success: true, config: cachedConfig, errors: [] },
    };
  }

  private buildCacheKey(input: ResolveConfigInput): string {
    const tenantId = input.tenantConfig.tenant?.id ?? input.tenantConfig.tenant?.slug ?? 'unknown';
    const environment =
      input.environment ?? input.tenantConfig.environment?.current ?? 'development';
    const version = input.tenantConfig.meta?.configVersion ?? 0;

    return `${tenantId}:${environment}:v${version}`;
  }
}
