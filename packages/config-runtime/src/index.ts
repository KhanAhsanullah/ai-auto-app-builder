/**
 * @ai-commerce/config-runtime
 *
 * Runtime configuration loader, resolver, validator, cache, and provider.
 * Merges platform → vertical → tenant → environment layers into immutable config.
 */

export { ConfigCache } from './config-cache.js';
export { ConfigLoader } from './config-loader.js';
export { ConfigProvider } from './config-provider.js';
export { ConfigResolver } from './config-resolver.js';
export { ConfigValidator } from './config-validator.js';
export { deepFreeze, deepMerge, shallowMergeSections } from './deep-merge.js';
export { PLATFORM_DEFAULTS } from './defaults/platform-defaults.js';
export { getVerticalDefaults, VERTICAL_DEFAULTS } from './defaults/vertical-defaults.js';
export {
  ConfigLoadException,
  ConfigResolutionException,
  ConfigValidationException,
  formatValidationErrorMessage,
  formatZodErrors,
} from './errors.js';
export type {
  CacheEntry,
  ConfigCacheOptions,
  ConfigLayer,
  ConfigLayerSource,
  ConfigProviderOptions,
  ConfigProviderResult,
  ConfigValidationError,
  DeepPartial,
  LoadConfigOptions,
  ResolveConfigInput,
  ResolvedConfig,
  ResolvedLayers,
  ValidationResult,
} from './types.js';
