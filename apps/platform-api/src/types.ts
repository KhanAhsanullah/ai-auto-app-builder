export type BoomLaunchVertical =
  'ecommerce' | 'grocery' | 'restaurant' | 'pharmacy' | 'fashion' | 'electronics';

/** Client Boom wizard payload accepted by the control-plane API. */
export interface BoomLaunchInput {
  businessName: string;
  vertical: BoomLaunchVertical;
  /** Optional logo URL applied as branding.logo.primary. */
  logoUrl?: string;
  /** Optional slug; derived from businessName when omitted. */
  slug?: string;
  /** Optional tenant UUID; generated when omitted. */
  tenantId?: string;
  defaultLocale?: string;
  defaultTimezone?: string;
  defaultCountry?: string;
}

/** JSON body for POST /v1/boom/launch. */
export interface BoomLaunchHttpBody {
  businessName?: unknown;
  vertical?: unknown;
  logoUrl?: unknown;
  slug?: unknown;
  tenantId?: unknown;
  defaultLocale?: unknown;
  defaultTimezone?: unknown;
  defaultCountry?: unknown;
}

export interface PlatformApiListenResult {
  port: number;
  host: string;
  close: () => Promise<void>;
}

/** Summary row for list/get tenant endpoints. */
export interface TenantSummary {
  tenantId: string;
  slug: string;
  status: string;
  vertical: string;
  name: string;
}

/** Config document payload for GET /v1/tenants/:id/config. */
export interface TenantConfigResponse {
  tenantId: string;
  slug: string;
  status: string;
  updatedAt: string;
  /** Prefer published ConfigEngine revision; falls back to registry layer. */
  document: Record<string, unknown>;
  /** Present when served from a published ConfigEngine revision. */
  configVersion?: number;
  publishId?: string;
}

/** Catalog product row returned by catalog endpoints. */
export interface CatalogProductDto {
  id: string;
  slug: string;
  name: string;
  sku: string;
  title: string;
  amount: number;
  currency: string;
  imageUrl: string;
}

/** Catalog payload for GET /v1/tenants/:id/catalog/products. */
export interface TenantCatalogResponse {
  tenantId: string;
  vertical: BoomLaunchVertical;
  updatedAt: string;
  products: CatalogProductDto[];
}

/** JSON body for POST /v1/tenants/:id/catalog/products. */
export interface CatalogProductCreateHttpBody {
  name?: unknown;
  sku?: unknown;
  title?: unknown;
  amount?: unknown;
  slug?: unknown;
  currency?: unknown;
  imageUrl?: unknown;
}

/** Validated create-product input. */
export interface CatalogProductCreateInput {
  name: string;
  sku: string;
  title: string;
  amount: number;
  slug: string;
  currency: string;
  imageUrl: string;
}

/** JSON body for PATCH /v1/tenants/:id/catalog/products/:productId. */
export interface CatalogProductPatchHttpBody {
  name?: unknown;
  sku?: unknown;
  title?: unknown;
  amount?: unknown;
  slug?: unknown;
  currency?: unknown;
  imageUrl?: unknown;
}

/** Validated patch-product input (at least one field). */
export interface CatalogProductPatchInput {
  name?: string;
  sku?: string;
  title?: string;
  amount?: number;
  slug?: string;
  currency?: string;
  imageUrl?: string;
}
