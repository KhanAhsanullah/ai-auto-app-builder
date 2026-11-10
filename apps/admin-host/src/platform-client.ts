export interface PlatformTenantSummary {
  tenantId: string;
  slug: string;
  status: string;
  vertical: string;
  name: string;
}

export interface PlatformTenantConfigResult {
  tenantId: string;
  slug: string;
  status: string;
  updatedAt: string;
  document: Record<string, unknown>;
  configVersion?: number;
  publishId?: string;
}

export interface PlatformCatalogProduct {
  id: string;
  slug: string;
  name: string;
  sku: string;
  title: string;
  amount: number;
  currency: string;
  imageUrl: string;
}

export interface PlatformCatalogResult {
  tenantId: string;
  vertical: string;
  updatedAt: string;
  products: PlatformCatalogProduct[];
}

export class PlatformClientError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PlatformClientError';
    this.statusCode = statusCode;
  }
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787';

/** Resolve platform-api base URL (Vite: VITE_PLATFORM_API_URL). */
export function resolvePlatformApiBaseUrl(
  env: Record<string, string | undefined> = import.meta.env as Record<string, string | undefined>,
): string {
  const fromEnv = env.VITE_PLATFORM_API_URL?.trim();
  return (fromEnv || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

async function requestJson(
  path: string,
  options: {
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<{ status: number; payload: Record<string, unknown> }> {
  const baseUrl = (options.baseUrl ?? resolvePlatformApiBaseUrl()).replace(/\/+$/, '');
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new PlatformClientError('fetch is not available in this environment.');
  }

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new PlatformClientError(
      `Could not reach platform-api at ${baseUrl}. Start it with: pnpm --filter @ai-commerce/platform-api start`,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, payload };
}

/** List provisioned tenants from platform-api. */
export async function listTenantsViaPlatformApi(
  options: {
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<PlatformTenantSummary[]> {
  const { status, payload } = await requestJson('/v1/tenants', options);
  if (status !== 200) {
    const message =
      typeof payload.error === 'string' ? payload.error : `Tenant list failed (${status}).`;
    throw new PlatformClientError(message, status);
  }

  if (!Array.isArray(payload.tenants)) {
    throw new PlatformClientError('platform-api returned an incomplete tenant list.');
  }

  const tenants: PlatformTenantSummary[] = [];
  for (const row of payload.tenants) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new PlatformClientError('platform-api returned an incomplete tenant list.');
    }
    const tenant = row as Record<string, unknown>;
    const tenantId = typeof tenant.tenantId === 'string' ? tenant.tenantId : '';
    const slug = typeof tenant.slug === 'string' ? tenant.slug : '';
    const statusValue = typeof tenant.status === 'string' ? tenant.status : '';
    const vertical = typeof tenant.vertical === 'string' ? tenant.vertical : '';
    const name = typeof tenant.name === 'string' ? tenant.name : slug;
    if (!tenantId || !slug || !statusValue) {
      throw new PlatformClientError('platform-api returned an incomplete tenant list.');
    }
    tenants.push({ tenantId, slug, status: statusValue, vertical, name });
  }
  return tenants;
}

/** Fetch published (or registry) tenant config. */
export async function fetchTenantConfigViaPlatformApi(
  tenantId: string,
  options: {
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<PlatformTenantConfigResult> {
  const id = tenantId.trim();
  if (!id) {
    throw new PlatformClientError('tenantId is required.');
  }

  const { status, payload } = await requestJson(
    `/v1/tenants/${encodeURIComponent(id)}/config`,
    options,
  );
  if (status !== 200) {
    const message =
      typeof payload.error === 'string' ? payload.error : `Tenant config fetch failed (${status}).`;
    throw new PlatformClientError(message, status);
  }

  const document = payload.document;
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new PlatformClientError('platform-api returned an incomplete tenant config.');
  }

  return {
    tenantId: typeof payload.tenantId === 'string' ? payload.tenantId : id,
    slug: typeof payload.slug === 'string' ? payload.slug : '',
    status: typeof payload.status === 'string' ? payload.status : 'active',
    updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : '',
    document: document as Record<string, unknown>,
    ...(typeof payload.configVersion === 'number' ? { configVersion: payload.configVersion } : {}),
    ...(typeof payload.publishId === 'string' ? { publishId: payload.publishId } : {}),
  };
}

/** Fetch platform-owned catalog products for a tenant. */
export async function fetchTenantCatalogViaPlatformApi(
  tenantId: string,
  options: {
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<PlatformCatalogResult> {
  const id = tenantId.trim();
  if (!id) {
    throw new PlatformClientError('tenantId is required.');
  }

  const { status, payload } = await requestJson(
    `/v1/tenants/${encodeURIComponent(id)}/catalog/products`,
    options,
  );
  if (status !== 200) {
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `Tenant catalog fetch failed (${status}).`;
    throw new PlatformClientError(message, status);
  }

  if (!Array.isArray(payload.products)) {
    throw new PlatformClientError('platform-api returned an incomplete tenant catalog.');
  }

  const products: PlatformCatalogProduct[] = [];
  for (const row of payload.products) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new PlatformClientError('platform-api returned an incomplete tenant catalog.');
    }
    const product = row as Record<string, unknown>;
    const productId = typeof product.id === 'string' ? product.id : '';
    const slug = typeof product.slug === 'string' ? product.slug : '';
    const name = typeof product.name === 'string' ? product.name : '';
    const sku = typeof product.sku === 'string' ? product.sku : '';
    const title = typeof product.title === 'string' ? product.title : '';
    const amount = typeof product.amount === 'number' ? product.amount : NaN;
    const currency = typeof product.currency === 'string' ? product.currency : '';
    const imageUrl = typeof product.imageUrl === 'string' ? product.imageUrl : '';
    if (!productId || !slug || !name || !sku || !title || !Number.isFinite(amount) || !currency) {
      throw new PlatformClientError('platform-api returned an incomplete tenant catalog.');
    }
    products.push({
      id: productId,
      slug,
      name,
      sku,
      title,
      amount,
      currency,
      imageUrl,
    });
  }

  return {
    tenantId: typeof payload.tenantId === 'string' ? payload.tenantId : id,
    vertical: typeof payload.vertical === 'string' ? payload.vertical : '',
    updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : '',
    products,
  };
}
