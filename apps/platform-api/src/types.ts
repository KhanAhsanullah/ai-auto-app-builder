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
  /** Tenant-layer config document from the registry. */
  document: Record<string, unknown>;
}
