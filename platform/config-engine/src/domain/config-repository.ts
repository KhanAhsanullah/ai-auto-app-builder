import type { ConfigDocument } from '../types.js';

/** Persistence port for versioned tenant config documents. */
export interface ConfigRepository {
  save(document: ConfigDocument): Promise<void>;
  findByTenantAndVersion(tenantId: string, version: number): Promise<ConfigDocument | undefined>;
  findLatestByTenant(tenantId: string): Promise<ConfigDocument | undefined>;
  listByTenant(tenantId: string): Promise<ConfigDocument[]>;
}
