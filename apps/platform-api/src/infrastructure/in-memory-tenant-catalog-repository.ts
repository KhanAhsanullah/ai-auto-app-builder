import type { TenantCatalogRepository } from '../domain/tenant-catalog-repository.js';
import type { TenantCatalogRecord } from '../domain/vertical-catalog-seeds.js';

/** In-memory tenant catalog store. */
export class InMemoryTenantCatalogRepository implements TenantCatalogRepository {
  private readonly byTenant = new Map<string, TenantCatalogRecord>();

  async findByTenantId(tenantId: string): Promise<TenantCatalogRecord | undefined> {
    const record = this.byTenant.get(tenantId);
    return record ? structuredClone(record) : undefined;
  }

  async save(record: TenantCatalogRecord): Promise<void> {
    this.byTenant.set(record.tenantId, structuredClone(record));
  }

  /** Snapshot of all catalogs (used by durable adapters). */
  listAll(): TenantCatalogRecord[] {
    return [...this.byTenant.values()].map((record) => structuredClone(record));
  }
}
