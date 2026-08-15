import type {
  BrandSurface,
  CompiledBrandResult,
  ProvideBrandFromConfigInput,
  ProvideBrandInput,
  ResolvedBrandResult,
  ResolveBrandInput,
  WhiteLabelProviderResult,
} from '../types.js';
import {
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
  type ConfigProviderBrandInput,
} from './map-config-brand-source.js';
import type { BrandCompiler } from './brand-compiler.js';
import type { BrandResolver } from './brand-resolver.js';

const DEFAULT_SURFACES: BrandSurface[] = ['web', 'mobile', 'admin-dashboard'];

/** Public facade for resolving and compiling tenant branding. */
export class WhiteLabelProvider {
  constructor(
    private readonly resolver: BrandResolver,
    private readonly compiler: BrandCompiler,
  ) {}

  /** Resolve branding without compiling surface artifacts. */
  resolve(input: ResolveBrandInput): ResolvedBrandResult {
    return this.resolver.resolve(input);
  }

  /** Resolve and compile brand artifacts from resolver input. */
  provide(input: ProvideBrandInput): WhiteLabelProviderResult {
    const { surfaces, skipCache, ...resolveInput } = input;
    const resolved = this.resolver.resolve(resolveInput);

    return this.compileResolved(resolved, { surfaces, skipCache });
  }

  /** Resolve and compile brand artifacts from a normalized config source. */
  provideFromConfig(input: ProvideBrandFromConfigInput): WhiteLabelProviderResult {
    return this.provide({
      ...toResolveBrandInput(input.source),
      surfaces: input.surfaces,
      skipCache: input.skipCache,
    });
  }

  /** Resolve and compile brand artifacts from Config Runtime output. */
  provideFromProviderResult(
    result: ConfigProviderBrandInput,
    options?: { surfaces?: BrandSurface[]; skipCache?: boolean },
  ): WhiteLabelProviderResult {
    return this.provideFromConfig({
      source: brandConfigSourceFromProviderResult(result),
      surfaces: options?.surfaces,
      skipCache: options?.skipCache,
    });
  }

  /** Retrieve cached compiled artifacts by asset hash and surfaces. */
  getCachedCompiled(
    assetHash: string,
    surfaces: BrandSurface[] = DEFAULT_SURFACES,
  ): CompiledBrandResult | undefined {
    return this.compiler.getCached(assetHash, surfaces);
  }

  /** Clear compiled brand cache entries. */
  clearCache(): void {
    this.compiler.clearCache();
  }

  /** Expose the underlying brand resolver. */
  getResolver(): BrandResolver {
    return this.resolver;
  }

  /** Expose the underlying brand compiler. */
  getCompiler(): BrandCompiler {
    return this.compiler;
  }

  private compileResolved(
    resolved: ResolvedBrandResult,
    options?: { surfaces?: BrandSurface[]; skipCache?: boolean },
  ): WhiteLabelProviderResult {
    const { result, fromCache } = this.compiler.compileFromResolvedWithMeta({
      resolved,
      surfaces: options?.surfaces,
      skipCache: options?.skipCache,
    });

    return {
      ...result,
      resolved,
      fromCache: options?.skipCache ? false : fromCache,
    };
  }
}
