import type { CheckoutSession } from '../types.js';

/** Persistence port for tenant-scoped checkout sessions. */
export interface CheckoutRepository {
  save(session: CheckoutSession): Promise<void>;
  update(session: CheckoutSession): Promise<void>;
  findById(tenantId: string, checkoutId: string): Promise<CheckoutSession | undefined>;
  findByCartId(tenantId: string, cartId: string): Promise<CheckoutSession | undefined>;
  listByTenant(tenantId: string): Promise<CheckoutSession[]>;
}
