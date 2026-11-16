import type {
  TenantOrderRepository,
  TenantOrdersRecord,
} from '../domain/tenant-order-repository.js';

/** In-memory tenant order store. */
export class InMemoryTenantOrderRepository implements TenantOrderRepository {
  private readonly byTenant = new Map<string, TenantOrdersRecord>();

  async findByTenantId(tenantId: string): Promise<TenantOrdersRecord | undefined> {
    const record = this.byTenant.get(tenantId);
    return record ? structuredClone(record) : undefined;
  }

  async save(record: TenantOrdersRecord): Promise<void> {
    this.byTenant.set(record.tenantId, structuredClone(record));
  }

  /** Snapshot of all order records (used by durable adapters). */
  listAll(): TenantOrdersRecord[] {
    return [...this.byTenant.values()].map((record) => structuredClone(record));
  }
}
