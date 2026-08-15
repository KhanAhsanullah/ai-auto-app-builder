import type { TenantRecord } from '../types.js';

/** Persistence port for tenant registry records. */
export interface TenantRepository {
  /** Find a tenant record by canonical tenant ID. */
  findById(tenantId: string): Promise<TenantRecord | undefined>;

  /** Find a tenant record by unique slug. */
  findBySlug(slug: string): Promise<TenantRecord | undefined>;

  /**
   * Persist a new tenant record.
   * Must reject duplicate tenant IDs and slugs without overwriting.
   */
  save(record: TenantRecord): Promise<void>;
}
