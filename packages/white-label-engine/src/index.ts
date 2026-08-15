/**
 * @ai-commerce/white-label-engine
 *
 * Resolves tenant branding through platform → vertical → tenant → environment layers.
 */

export { BrandCompiler } from './domain/brand-compiler.js';
export { BrandResolver } from './domain/brand-resolver.js';
export { WhiteLabelProvider } from './domain/white-label-provider.js';
export { createWhiteLabelProvider } from './infrastructure/create-white-label-provider.js';
export {
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from './domain/map-config-brand-source.js';
export type { ConfigProviderBrandInput } from './domain/map-config-brand-source.js';
export {
  AssetValidationException,
  BrandCompilationException,
  BrandResolutionException,
  WhiteLabelEngineException,
} from './errors.js';
export { BRAND_COMPILER_VERSION } from './types.js';
export type {
  AdminDashboardBrandArtifacts,
  AppIconResolvedFrom,
  AssetHashPayload,
  BrandAssetManifest,
  BrandAssetManifestEntry,
  BrandConfigSource,
  BrandHashPayload,
  BrandLayers,
  BrandMetadata,
  BrandPatch,
  BrandSurface,
  CompileBrandFromConfigInput,
  CompileBrandFromResolvedInput,
  CompiledBrandMetadata,
  CompiledBrandResult,
  CompiledSurfaceArtifacts,
  MobileBrandArtifacts,
  NormalizedAssetRef,
  NormalizedBrandAssets,
  NormalizedFontAsset,
  ProvideBrandFromConfigInput,
  ProvideBrandInput,
  ResolveBrandInput,
  ResolvedAppIconSource,
  ResolvedBrandResult,
  WebBrandArtifacts,
  WhiteLabelProviderOptions,
  WhiteLabelProviderResult,
} from './types.js';
