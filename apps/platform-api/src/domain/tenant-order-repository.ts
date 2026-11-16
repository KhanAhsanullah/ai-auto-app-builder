import type { PlatformOrderDto } from '../types.js';

/** Persisted orders for one tenant. */
export interface TenantOrdersRecord {
  tenantId: string;
  orders: PlatformOrderDto[];
  updatedAt: string;
}

/** Port for platform-owned tenant order durability. */
export interface TenantOrderRepository {
  findByTenantId(tenantId: string): Promise<TenantOrdersRecord | undefined>;
  save(record: TenantOrdersRecord): Promise<void>;
}
