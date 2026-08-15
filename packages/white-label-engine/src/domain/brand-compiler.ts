import type { BrandEmitterRegistry } from '../domain/brand-emitter-registry.js';
import { BrandCompilationException } from '../errors.js';
import type {
  BrandAssetManifest,
  BrandAssetManifestEntry,
  BrandCacheOptions,
  BrandSurface,
  CompileBrandFromConfigInput,
  CompileBrandFromResolvedInput,
  CompiledBrandResult,
  NormalizedBrandAssets,
} from '../types.js';
import { BRAND_COMPILER_VERSION } from '../types.js';
import { AssetNormalizer } from './asset-normalizer.js';
import { BrandResolver } from './brand-resolver.js';
import { BrandCache } from '../infrastructure/brand-cache.js';
import { DefaultBrandEmitterRegistry } from '../infrastructure/brand-emitter-registry.js';
import { computeAssetHash } from '../utils/asset-hash.js';

const DEFAULT_SURFACES: BrandSurface[] = ['web', 'mobile', 'admin-dashboard'];

/** Compiles resolved brand assets into surface-specific reference artifacts. */
export class BrandCompiler {
  private readonly resolver: BrandResolver;
  private readonly normalizer: AssetNormalizer;
  private readonly emitterRegistry: BrandEmitterRegistry;
  private readonly cache: BrandCache | null;

  constructor(options?: {
    resolver?: BrandResolver;
    normalizer?: AssetNormalizer;
    emitterRegistry?: BrandEmitterRegistry;
    cache?: BrandCacheOptions | false;
  }) {
    this.resolver = options?.resolver ?? new BrandResolver();
    this.normalizer = options?.normalizer ?? new AssetNormalizer();
    this.emitterRegistry = options?.emitterRegistry ?? new DefaultBrandEmitterRegistry();
    this.cache = options?.cache === false ? null : new BrandCache(options?.cache);
  }

  /** Compile from resolver input (resolve + normalize + emit). */
  compile(input: CompileBrandFromConfigInput): CompiledBrandResult {
    const { surfaces, ...resolveInput } = input;
    const resolved = this.resolver.resolve(resolveInput);

    return this.compileFromResolved({ resolved, surfaces });
  }

  /** Compile from an already-resolved brand result. */
  compileFromResolved(input: CompileBrandFromResolvedInput): CompiledBrandResult {
    const surfaces = input.surfaces ?? DEFAULT_SURFACES;
    const assets = this.normalizer.normalize(input.resolved);
    const assetHash = computeAssetHash(this.buildAssetHashPayload(assets));
    const cacheKey = this.buildCacheKey(assetHash, surfaces);

    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const manifest = this.buildManifest(assets, input.resolved.metadata.hash, assetHash);
    const result = this.buildCompiledResult(assets, manifest, surfaces);

    if (this.cache) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /** Retrieve a cached compiled result by asset hash and surfaces. */
  getCached(
    assetHash: string,
    surfaces: BrandSurface[] = DEFAULT_SURFACES,
  ): CompiledBrandResult | undefined {
    return this.cache?.get(this.buildCacheKey(assetHash, surfaces));
  }

  /** Clear compiled brand cache entries. */
  clearCache(): void {
    this.cache?.clear();
  }

  /** Expose the underlying brand resolver. */
  getResolver(): BrandResolver {
    return this.resolver;
  }

  /** Expose the configured emitter registry. */
  getEmitterRegistry(): BrandEmitterRegistry {
    return this.emitterRegistry;
  }

  private buildCompiledResult(
    assets: NormalizedBrandAssets,
    manifest: BrandAssetManifest,
    surfaces: BrandSurface[],
  ): CompiledBrandResult {
    const artifacts = {} as CompiledBrandResult['artifacts'];

    for (const surface of surfaces) {
      if (!this.emitterRegistry.has(surface)) {
        throw new BrandCompilationException(`Unsupported brand surface: ${surface}`);
      }

      Object.assign(artifacts, {
        [surface]: this.emitterRegistry.emit(surface, assets),
      });
    }

    if (Object.keys(artifacts).length === 0) {
      throw new BrandCompilationException('At least one surface must be requested for compilation');
    }

    const compiledAt = new Date().toISOString();

    return {
      assets,
      metadata: {
        brandHash: assets.metadata.hash,
        assetHash: manifest.assetHash,
        compiledAt,
      },
      manifest,
      artifacts,
      compiledAt,
    };
  }

  private buildManifest(
    assets: NormalizedBrandAssets,
    brandHash: string,
    assetHash: string,
  ): BrandAssetManifest {
    const entries: BrandAssetManifestEntry[] = [];

    const pushAsset = (asset?: {
      id: string;
      url: string;
      kind: BrandAssetManifestEntry['kind'];
      role: BrandAssetManifestEntry['role'];
      format: string;
    }) => {
      if (!asset) {
        return;
      }

      entries.push({
        id: asset.id,
        url: asset.url,
        kind: asset.kind,
        role: asset.role,
        format: asset.format,
      });
    };

    pushAsset(assets.logos.primary);
    pushAsset(assets.logos.inverse);
    pushAsset(assets.logos.favicon);
    pushAsset(assets.logos.appIcon);
    pushAsset(assets.logos.appleTouchIcon);
    pushAsset(assets.appIconSource?.source);
    pushAsset(assets.splash?.image);
    pushAsset(assets.social?.ogImage);
    pushAsset(assets.fonts?.heading);
    pushAsset(assets.fonts?.body);

    entries.sort((a, b) => a.id.localeCompare(b.id));

    return {
      version: 1,
      brandHash,
      assetHash,
      assets: entries,
      splash: assets.splash?.backgroundColor
        ? { backgroundColor: assets.splash.backgroundColor }
        : undefined,
    };
  }

  private buildAssetHashPayload(assets: NormalizedBrandAssets) {
    return {
      compilerVersion: BRAND_COMPILER_VERSION,
      logos: assets.logos,
      appIconSource: assets.appIconSource,
      splash: assets.splash,
      social: assets.social,
      fonts: assets.fonts,
    };
  }

  private buildCacheKey(assetHash: string, surfaces: BrandSurface[]): string {
    return `${assetHash}:${[...surfaces].sort().join(',')}`;
  }
}
