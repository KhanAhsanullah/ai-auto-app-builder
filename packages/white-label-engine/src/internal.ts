export { AssetNormalizer } from './domain/asset-normalizer.js';
export { BrandCompiler } from './domain/brand-compiler.js';
export { BrandCache } from './infrastructure/brand-cache.js';
export { DefaultBrandEmitterRegistry } from './infrastructure/brand-emitter-registry.js';
export { AdminDashboardBrandEmitter } from './infrastructure/emitters/admin-dashboard-emitter.js';
export { MobileBrandEmitter } from './infrastructure/emitters/mobile-emitter.js';
export { WebBrandEmitter } from './infrastructure/emitters/web-emitter.js';
export { computeAssetHash } from './utils/asset-hash.js';
export {
  ASSET_EXTENSION_RULES,
  inferFormatFromUrl,
  parseAssetUrl,
  validateAssetExtension,
} from './utils/asset-validation.js';
export type { BrandEmitterRegistry } from './domain/brand-emitter-registry.js';
export type {
  AnyBrandEmitter,
  BrandAssetManifest,
  BrandAssetManifestEntry,
  BrandCacheEntry,
  BrandCacheOptions,
  BrandEmitter,
  BrandSurface,
  CompileBrandFromConfigInput,
  CompileBrandFromResolvedInput,
  CompiledBrandMetadata,
  CompiledBrandResult,
  CompiledSurfaceArtifacts,
  NormalizedAssetRef,
  NormalizedBrandAssets,
  NormalizedFontAsset,
  ResolvedAppIconSource,
} from './types.js';
