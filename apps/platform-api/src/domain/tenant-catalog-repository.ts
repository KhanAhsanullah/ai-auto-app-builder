import type { TenantCatalogRecord } from '../domain/vertical-catalog-seeds.js';

/** Persistence port for platform-owned tenant catalogs. */
export interface TenantCatalogRepository {
  findByTenantId(tenantId: string): Promise<TenantCatalogRecord | undefined>;
  save(record: TenantCatalogRecord): Promise<void>;
}
