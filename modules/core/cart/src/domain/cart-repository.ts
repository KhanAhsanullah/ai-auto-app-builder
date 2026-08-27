import type { Cart } from '../types.js';

/** Persistence port for tenant-scoped carts. */
export interface CartRepository {
  save(cart: Cart): Promise<void>;
  update(cart: Cart): Promise<void>;
  findById(tenantId: string, cartId: string): Promise<Cart | undefined>;
  listByTenant(tenantId: string): Promise<Cart[]>;
  findByCustomerId(tenantId: string, customerId: string): Promise<Cart | undefined>;
  findBySessionId(tenantId: string, sessionId: string): Promise<Cart | undefined>;
}
