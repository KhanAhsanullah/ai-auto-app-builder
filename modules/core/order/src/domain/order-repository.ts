import type { Order } from '../types.js';

/** Persistence port for tenant-scoped orders. */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  findById(tenantId: string, orderId: string): Promise<Order | undefined>;
  findByCheckoutId(tenantId: string, checkoutId: string): Promise<Order | undefined>;
  listByTenant(tenantId: string): Promise<Order[]>;
}
