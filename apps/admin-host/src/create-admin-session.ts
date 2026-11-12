import { createAdminDashboard, type AdminDashboard } from '@ai-commerce/admin-dashboard';
import { ConfigProvider, type ConfigLayer } from '@ai-commerce/config-runtime';

import { enrichAdminConfigDocument } from './enrich-admin-config.js';
import {
  fetchTenantCatalogViaPlatformApi,
  fetchTenantConfigViaPlatformApi,
  type PlatformCatalogResult,
  type PlatformTenantConfigResult,
} from './platform-client.js';
import { seedCatalogFromPlatformProducts } from './seed-catalog-from-platform.js';

export interface AdminSession {
  dashboard: AdminDashboard;
  config: PlatformTenantConfigResult;
  catalog: PlatformCatalogResult;
}

/** Boot admin dashboard for a tenant from platform-api config + catalog. */
export async function createAdminSessionFromPlatform(input: {
  tenantId: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => string;
}): Promise<AdminSession> {
  const config = await fetchTenantConfigViaPlatformApi(input.tenantId, {
    baseUrl: input.baseUrl,
    fetchImpl: input.fetchImpl,
  });
  const catalogPayload = await fetchTenantCatalogViaPlatformApi(input.tenantId, {
    baseUrl: input.baseUrl,
    fetchImpl: input.fetchImpl,
  });

  const enriched = enrichAdminConfigDocument(config.document);
  const resolved = new ConfigProvider({ cache: false }).resolve({
    tenantConfig: enriched as ConfigLayer,
  });

  const catalog = await seedCatalogFromPlatformProducts({
    tenantId: catalogPayload.tenantId,
    products: catalogPayload.products,
    now: input.now,
  });

  const dashboard = createAdminDashboard({
    config: resolved,
    catalog,
    roles: ['manager'],
    initialRoute: 'admin.catalog',
  });

  return {
    dashboard,
    config,
    catalog: catalogPayload,
  };
}
