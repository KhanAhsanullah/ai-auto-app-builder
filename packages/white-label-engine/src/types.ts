import type {
  Branding,
  EnvironmentSettings,
  Tenant,
  TenantConfiguration,
} from '@ai-commerce/config-schema';

/** Compiler version included in asset hash payloads for forward-compatible invalidation. */
export const BRAND_COMPILER_VERSION = 1;

/** Engine metadata populated by BrandResolver. */
export interface BrandMetadata {
  brandVersion: number;
  compiledAt: string;
  hash: string;
}

/** Partial branding patch supporting nested overrides (e.g. logo.primary only). */
export type BrandPatch = Partial<
  Omit<Branding, 'logo' | 'splashScreen' | 'socialShare' | 'fonts' | 'metadata'>
> & {
  logo?: Partial<NonNullable<Branding['logo']>>;
  splashScreen?: Partial<NonNullable<Branding['splashScreen']>>;
  socialShare?: Partial<NonNullable<Branding['socialShare']>>;
  fonts?: Partial<{
    heading?: Partial<NonNullable<NonNullable<Branding['fonts']>['heading']>>;
    body?: Partial<NonNullable<NonNullable<Branding['fonts']>['body']>>;
  }>;
  metadata?: NonNullable<Branding['metadata']>;
};

/** Audit layers showing branding inheritance contributions. */
export interface BrandLayers {
  platform: BrandPatch;
  vertical: BrandPatch;
  tenant: BrandPatch;
  environment: BrandPatch;
}

/** Input for BrandResolver. */
export interface ResolveBrandInput {
  tenantId?: string;
  environment?: EnvironmentSettings['current'];
  vertical?: Tenant['vertical'];
  tenantBranding?: BrandPatch;
  environmentBranding?: BrandPatch;
  platformDefaults?: BrandPatch;
  verticalDefaults?: BrandPatch;
}

/** Output from BrandResolver. */
export interface ResolvedBrandResult {
  branding: Branding;
  metadata: BrandMetadata;
  layers: BrandLayers;
  tenantId?: string;
  vertical?: Tenant['vertical'];
  environment?: EnvironmentSettings['current'];
}

/** Canonical payload hashed for metadata.hash. */
export interface BrandHashPayload {
  appName: Branding['appName'];
  tagline: Branding['tagline'];
  logo?: Branding['logo'];
  fonts?: Branding['fonts'];
  splashScreen?: Branding['splashScreen'];
  socialShare?: Branding['socialShare'];
  showPoweredBy?: Branding['showPoweredBy'];
  copyrightText?: Branding['copyrightText'];
}

/** Normalized config source consumed without re-resolving Config Runtime. */
export interface BrandConfigSource {
  config: {
    branding: Branding;
    tenant?: TenantConfiguration['tenant'];
  };
  layers: {
    environment?: {
      branding?: BrandPatch;
    };
  };
  environment: EnvironmentSettings['current'];
  vertical: Tenant['vertical'];
}

/** Supported brand asset compilation output surfaces. */
export type BrandSurface = 'web' | 'mobile' | 'admin-dashboard';

/** Normalized asset kind for manifest inventory. */
export type AssetKind = 'logo' | 'icon' | 'splash' | 'social' | 'font';

/** Normalized asset role within the brand asset inventory. */
export type AssetRole =
  | 'primary'
  | 'inverse'
  | 'favicon'
  | 'app-icon'
  | 'apple-touch'
  | 'splash'
  | 'og-image'
  | 'heading'
  | 'body';

/** Source field used to resolve the effective app icon. */
export type AppIconResolvedFrom = 'appIcon' | 'appleTouchIcon' | 'primary';

/** Normalized non-font asset reference. */
export interface NormalizedAssetRef {
  id: string;
  url: string;
  kind: AssetKind;
  role: AssetRole;
  format: string;
}

/** Normalized font asset reference. */
export interface NormalizedFontAsset {
  id: string;
  url: string;
  kind: 'font';
  role: 'heading' | 'body';
  format: string;
  weight?: number;
  style?: 'normal' | 'italic';
}

/** Resolved effective app icon with fallback metadata. */
export interface ResolvedAppIconSource {
  source: NormalizedAssetRef;
  resolvedFrom: AppIconResolvedFrom;
}

/** Canonical normalized brand assets consumed by emitters and manifest generation. */
export interface NormalizedBrandAssets {
  logos: {
    primary?: NormalizedAssetRef;
    inverse?: NormalizedAssetRef;
    favicon?: NormalizedAssetRef;
    appIcon?: NormalizedAssetRef;
    appleTouchIcon?: NormalizedAssetRef;
  };
  appIconSource?: ResolvedAppIconSource;
  splash?: {
    backgroundColor?: string;
    image?: NormalizedAssetRef;
  };
  social?: {
    ogImage?: NormalizedAssetRef;
  };
  fonts?: {
    heading?: NormalizedFontAsset;
    body?: NormalizedFontAsset;
  };
  metadata: BrandMetadata;
}

/** Canonical payload hashed for compiled asset metadata.assetHash. */
export interface AssetHashPayload {
  compilerVersion: number;
  logos: NormalizedBrandAssets['logos'];
  appIconSource?: NormalizedBrandAssets['appIconSource'];
  splash?: NormalizedBrandAssets['splash'];
  social?: NormalizedBrandAssets['social'];
  fonts?: NormalizedBrandAssets['fonts'];
}

/** Cross-surface asset manifest entry. */
export interface BrandAssetManifestEntry {
  id: string;
  url: string;
  kind: AssetKind;
  role: AssetRole;
  format: string;
}

/** Deterministic compiled brand asset manifest. */
export interface BrandAssetManifest {
  version: 1;
  brandHash: string;
  assetHash: string;
  assets: BrandAssetManifestEntry[];
  splash?: {
    backgroundColor?: string;
  };
}

/** HTML link descriptor emitted for web surfaces. */
export interface WebBrandLinkDescriptor {
  rel: string;
  href: string;
  sizes?: string;
  type?: string;
}

/** Web surface compiled brand artifacts. */
export interface WebBrandArtifacts {
  surface: 'web';
  faviconHref?: string;
  appleTouchIconHref?: string;
  logoPrimaryHref?: string;
  logoInverseHref?: string;
  appIconSourceHref?: string;
  appIconResolvedFrom?: AppIconResolvedFrom;
  splashBackgroundColor?: string;
  splashImageHref?: string;
  ogImageHref?: string;
  fontFaceCss?: string;
  links: WebBrandLinkDescriptor[];
}

/** Mobile icon size specification metadata for future binary generation. */
export interface MobileIconSizeSpec {
  size: number;
  purpose: 'app-icon' | 'adaptive-icon' | 'notification';
}

/** Mobile surface compiled brand artifacts. */
export interface MobileBrandArtifacts {
  surface: 'mobile';
  appIconSourceUrl?: string;
  appIconResolvedFrom?: AppIconResolvedFrom;
  iconSizesSpec: MobileIconSizeSpec[];
  splash: {
    backgroundColor?: string;
    imageUrl?: string;
  };
  logoPrimaryUrl?: string;
  fonts?: {
    heading?: NormalizedFontAsset;
    body?: NormalizedFontAsset;
  };
}

/** Admin dashboard surface compiled brand artifacts. */
export interface AdminDashboardBrandArtifacts {
  surface: 'admin-dashboard';
  headerLogoUrl?: string;
  headerLogoInverseUrl?: string;
  faviconHref?: string;
  appIconSourceHref?: string;
}

/** Map of compiled artifacts keyed by surface. */
export type CompiledSurfaceArtifacts = {
  web: WebBrandArtifacts;
  mobile: MobileBrandArtifacts;
  'admin-dashboard': AdminDashboardBrandArtifacts;
};

/** Metadata attached to compiled brand results. */
export interface CompiledBrandMetadata {
  brandHash: string;
  assetHash: string;
  compiledAt: string;
}

/** Result of compiling a resolved brand for one or more surfaces. */
export interface CompiledBrandResult<TSurfaces extends BrandSurface = BrandSurface> {
  assets: NormalizedBrandAssets;
  metadata: CompiledBrandMetadata;
  manifest: BrandAssetManifest;
  artifacts: Pick<CompiledSurfaceArtifacts, TSurfaces>;
  compiledAt: string;
}

/** Input for BrandCompiler when starting from resolved brand output. */
export interface CompileBrandFromResolvedInput {
  resolved: ResolvedBrandResult;
  surfaces?: BrandSurface[];
}

/** Input for BrandCompiler when starting from resolver input. */
export interface CompileBrandFromConfigInput extends ResolveBrandInput {
  surfaces?: BrandSurface[];
}

/** Brand cache entry metadata. */
export interface BrandCacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt?: number;
}

/** Brand cache configuration options. */
export interface BrandCacheOptions {
  maxEntries?: number;
  ttlMs?: number;
}

/** Brand surface emitter contract. */
export interface BrandEmitter<TSurface extends BrandSurface = BrandSurface> {
  readonly surface: TSurface;
  emit(assets: NormalizedBrandAssets): CompiledSurfaceArtifacts[TSurface];
}

/** Union of all built-in brand emitters. */
export type AnyBrandEmitter = {
  [TSurface in BrandSurface]: BrandEmitter<TSurface>;
}[BrandSurface];
