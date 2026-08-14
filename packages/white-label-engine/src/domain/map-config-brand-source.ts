import type {
  Branding,
  EnvironmentSettings,
  Tenant,
  TenantConfiguration,
} from '@ai-commerce/config-schema';

import type { BrandConfigSource, BrandPatch, ResolveBrandInput } from '../types.js';

/** Input shape produced by ConfigProvider (structural; no config-runtime import). */
export interface ConfigProviderBrandInput {
  readonly config: Readonly<{
    branding: Branding;
    tenant?: TenantConfiguration['tenant'];
  }>;
  readonly layers: Readonly<{
    readonly environment?: Readonly<{
      branding?: unknown;
    }>;
  }>;
  readonly environment: EnvironmentSettings['current'];
  readonly vertical: Tenant['vertical'];
}

/** Map resolved configuration output to brand resolver input without re-resolving config. */
export function toResolveBrandInput(source: BrandConfigSource): ResolveBrandInput {
  return {
    tenantId: source.config.tenant?.id,
    environment: source.environment,
    vertical: source.vertical,
    tenantBranding: source.config.branding,
    environmentBranding: source.layers.environment?.branding,
  };
}

/** Normalize Config Runtime output into a BrandConfigSource. */
export function brandConfigSourceFromProviderResult(
  result: ConfigProviderBrandInput,
): BrandConfigSource {
  return {
    config: {
      branding: result.config.branding,
      tenant: result.config.tenant,
    },
    layers: {
      environment: result.layers.environment
        ? { branding: result.layers.environment.branding as BrandPatch | undefined }
        : undefined,
    },
    environment: result.environment,
    vertical: result.vertical,
  };
}
