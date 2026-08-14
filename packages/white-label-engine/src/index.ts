/**
 * @ai-commerce/white-label-engine
 *
 * Resolves tenant branding through platform → vertical → tenant → environment layers.
 */

export { BrandResolver } from './domain/brand-resolver.js';
export {
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from './domain/map-config-brand-source.js';
export type { ConfigProviderBrandInput } from './domain/map-config-brand-source.js';
export { BrandResolutionException, WhiteLabelEngineException } from './errors.js';
export type {
  BrandConfigSource,
  BrandHashPayload,
  BrandLayers,
  BrandMetadata,
  BrandPatch,
  ResolveBrandInput,
  ResolvedBrandResult,
} from './types.js';
