import type { CompiledSurfaceArtifacts, NormalizedDesignTokens, ThemeSurface } from '../types.js';

/** Port for resolving surface emitters without coupling to concrete implementations. */
export interface ThemeEmitterRegistry {
  /** Emit artifacts for a registered surface. */
  emit<T extends ThemeSurface>(
    surface: T,
    tokens: NormalizedDesignTokens,
  ): CompiledSurfaceArtifacts[T];

  /** Whether an emitter is registered for the surface. */
  has(surface: ThemeSurface): boolean;
}
