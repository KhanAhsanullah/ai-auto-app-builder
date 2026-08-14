import type {
  Branding,
  EnvironmentSettings,
  Tenant,
  TenantConfiguration,
} from '@ai-commerce/config-schema';

/** Engine metadata populated by BrandResolver. */
export interface BrandMetadata {
  brandVersion: number;
  compiledAt: string;
  hash: string;
}

/** Partial branding patch supporting nested overrides (e.g. logo.primary only). */
export type BrandPatch = Partial<
  Omit<Branding, 'logo' | 'splashScreen' | 'socialShare' | 'metadata'>
> & {
  logo?: Partial<NonNullable<Branding['logo']>>;
  splashScreen?: Partial<NonNullable<Branding['splashScreen']>>;
  socialShare?: Partial<NonNullable<Branding['socialShare']>>;
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
