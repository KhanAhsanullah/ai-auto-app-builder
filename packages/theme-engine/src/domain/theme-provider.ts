import type {
  CompiledThemeResult,
  ProvideThemeFromConfigInput,
  ProvideThemeInput,
  ResolvedThemeResult,
  ResolveThemeInput,
  ThemeProviderResult,
  ThemeSurface,
} from '../types.js';
import {
  themeConfigSourceFromProviderResult,
  toResolveThemeInput,
  type ConfigProviderThemeInput,
} from './map-config-theme-source.js';
import type { ThemeCompiler } from './theme-compiler.js';
import type { ThemeResolver } from './theme-resolver.js';

const DEFAULT_SURFACES: ThemeSurface[] = ['css', 'tailwind', 'react-native', 'admin-dashboard'];

/** Public facade for resolving and compiling tenant themes. */
export class ThemeProvider {
  constructor(
    private readonly resolver: ThemeResolver,
    private readonly compiler: ThemeCompiler,
  ) {}

  /** Resolve a theme without compiling surface artifacts. */
  resolve(input: ResolveThemeInput): ResolvedThemeResult {
    return this.resolver.resolve(input);
  }

  /** Resolve and compile theme artifacts from resolver input. */
  provide(input: ProvideThemeInput): ThemeProviderResult {
    const { surfaces, skipCache, ...resolveInput } = input;
    const resolved = this.resolver.resolve(resolveInput);

    return this.compileResolved(resolved, { surfaces, skipCache });
  }

  /** Resolve and compile theme artifacts from a normalized config source. */
  provideFromConfig(input: ProvideThemeFromConfigInput): ThemeProviderResult {
    return this.provide({
      ...toResolveThemeInput(input.source),
      surfaces: input.surfaces,
      skipCache: input.skipCache,
    });
  }

  /** Resolve and compile theme artifacts from Config Runtime output. */
  provideFromProviderResult(
    result: ConfigProviderThemeInput,
    options?: { surfaces?: ThemeSurface[]; skipCache?: boolean },
  ): ThemeProviderResult {
    return this.provideFromConfig({
      source: themeConfigSourceFromProviderResult(result),
      surfaces: options?.surfaces,
      skipCache: options?.skipCache,
    });
  }

  /** Retrieve cached compiled artifacts by theme hash and surfaces. */
  getCachedCompiled(
    hash: string,
    surfaces: ThemeSurface[] = DEFAULT_SURFACES,
  ): CompiledThemeResult | undefined {
    return this.compiler.getCached(hash, surfaces);
  }

  /** Clear compiled theme cache entries. */
  clearCache(): void {
    this.compiler.clearCache();
  }

  /** Expose the underlying theme resolver. */
  getResolver(): ThemeResolver {
    return this.resolver;
  }

  /** Expose the underlying theme compiler. */
  getCompiler(): ThemeCompiler {
    return this.compiler;
  }

  private compileResolved(
    resolved: ResolvedThemeResult,
    options?: { surfaces?: ThemeSurface[]; skipCache?: boolean },
  ): ThemeProviderResult {
    const surfaces = options?.surfaces;

    if (!options?.skipCache) {
      const cached = this.compiler.getCached(resolved.metadata.hash, surfaces);

      if (cached) {
        return {
          ...cached,
          resolved,
          fromCache: true,
        };
      }
    }

    const compiled = this.compiler.compileFromResolved({ resolved, surfaces });

    return {
      ...compiled,
      resolved,
      fromCache: false,
    };
  }
}
