import type {
  CompiledThemeResult,
  CompileFromConfigInput,
  CompileFromResolvedInput,
  NormalizedDesignTokens,
  ThemeCacheOptions,
  ThemeSurface,
} from '../types.js';
import { ThemeCompilationException } from '../errors.js';
import { ThemeCache } from '../infrastructure/theme-cache.js';
import type { ThemeEmitterRegistry } from './theme-emitter-registry.js';
import { ThemeResolver } from './theme-resolver.js';
import { TokenNormalizer } from './token-normalizer.js';

const DEFAULT_SURFACES: ThemeSurface[] = ['css', 'tailwind', 'react-native', 'admin-dashboard'];

/** Compiles resolved themes into surface-specific design token artifacts. */
export class ThemeCompiler {
  private readonly resolver: ThemeResolver;
  private readonly normalizer: TokenNormalizer;
  private readonly emitterRegistry: ThemeEmitterRegistry;
  private readonly cache: ThemeCache | null;

  constructor(options: {
    emitterRegistry: ThemeEmitterRegistry;
    resolver?: ThemeResolver;
    normalizer?: TokenNormalizer;
    cache?: ThemeCacheOptions | false;
  }) {
    this.emitterRegistry = options.emitterRegistry;
    this.resolver = options.resolver ?? new ThemeResolver();
    this.normalizer = options.normalizer ?? new TokenNormalizer();
    this.cache = options.cache === false ? null : new ThemeCache(options.cache);
  }

  /** Compile from resolver input (resolve + normalize + emit). */
  compile(input: CompileFromConfigInput): CompiledThemeResult {
    const { surfaces, ...resolveInput } = input;
    const resolved = this.resolver.resolve(resolveInput);

    return this.compileFromResolved({ resolved, surfaces });
  }

  /** Compile from an already-resolved theme result. */
  compileFromResolved(input: CompileFromResolvedInput): CompiledThemeResult {
    const surfaces = input.surfaces ?? DEFAULT_SURFACES;
    const cacheKey = this.buildCacheKey(input.resolved.metadata.hash, surfaces);

    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const tokens = this.normalizer.normalize(input.resolved);
    const result = this.buildCompiledResult(tokens, surfaces);

    if (this.cache) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /** Retrieve a cached compiled result by theme hash and surfaces. */
  getCached(
    hash: string,
    surfaces: ThemeSurface[] = DEFAULT_SURFACES,
  ): CompiledThemeResult | undefined {
    return this.cache?.get(this.buildCacheKey(hash, surfaces));
  }

  /** Clear compiled theme cache entries. */
  clearCache(): void {
    this.cache?.clear();
  }

  /** Expose the underlying theme resolver. */
  getResolver(): ThemeResolver {
    return this.resolver;
  }

  /** Expose the configured emitter registry. */
  getEmitterRegistry(): ThemeEmitterRegistry {
    return this.emitterRegistry;
  }

  private buildCompiledResult(
    tokens: NormalizedDesignTokens,
    surfaces: ThemeSurface[],
  ): CompiledThemeResult {
    const artifacts = {} as CompiledThemeResult['artifacts'];

    for (const surface of surfaces) {
      if (!this.emitterRegistry.has(surface)) {
        throw new ThemeCompilationException(`Unsupported theme surface: ${surface}`);
      }

      Object.assign(artifacts, {
        [surface]: this.emitterRegistry.emit(surface, tokens),
      });
    }

    if (Object.keys(artifacts).length === 0) {
      throw new ThemeCompilationException('At least one surface must be requested for compilation');
    }

    return {
      tokens,
      metadata: tokens.metadata,
      artifacts,
      compiledAt: new Date().toISOString(),
    };
  }

  private buildCacheKey(hash: string, surfaces: ThemeSurface[]): string {
    return `${hash}:${[...surfaces].sort().join(',')}`;
  }
}
