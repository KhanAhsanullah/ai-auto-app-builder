import type { CompiledSurfaceArtifacts, NormalizedBrandAssets, BrandSurface } from '../types.js';

/** Port for resolving brand surface emitters without coupling to concrete implementations. */
export interface BrandEmitterRegistry {
  /** Emit artifacts for a registered surface. */
  emit<T extends BrandSurface>(
    surface: T,
    assets: NormalizedBrandAssets,
  ): CompiledSurfaceArtifacts[T];

  /** Whether an emitter is registered for the surface. */
  has(surface: BrandSurface): boolean;
}
