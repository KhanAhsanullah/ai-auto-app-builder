import type { CartRepository } from '../domain/cart-repository.js';
import { CartException, CartNotFoundException } from '../errors.js';
import type { Cart } from '../types.js';

function cartKey(tenantId: string, cartId: string): string {
  return `${tenantId}::${cartId}`;
}

/** In-memory CartRepository for tests and local development. */
export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, Cart>();

  async save(cart: Cart): Promise<void> {
    const key = cartKey(cart.tenantId, cart.id);
    if (this.carts.has(key)) {
      throw new CartException(`Cart '${cart.id}' already exists for tenant '${cart.tenantId}'.`);
    }
    this.carts.set(key, structuredClone(cart));
  }

  async update(cart: Cart): Promise<void> {
    const key = cartKey(cart.tenantId, cart.id);
    if (!this.carts.has(key)) {
      throw new CartNotFoundException(cart.tenantId, cart.id);
    }
    this.carts.set(key, structuredClone(cart));
  }

  async findById(tenantId: string, cartId: string): Promise<Cart | undefined> {
    const found = this.carts.get(cartKey(tenantId, cartId));
    return found ? structuredClone(found) : undefined;
  }

  async listByTenant(tenantId: string): Promise<Cart[]> {
    return [...this.carts.values()]
      .filter((cart) => cart.tenantId === tenantId)
      .map((cart) => structuredClone(cart));
  }

  async findByCustomerId(tenantId: string, customerId: string): Promise<Cart | undefined> {
    for (const cart of this.carts.values()) {
      if (cart.tenantId === tenantId && cart.customerId === customerId) {
        return structuredClone(cart);
      }
    }
    return undefined;
  }

  async findBySessionId(tenantId: string, sessionId: string): Promise<Cart | undefined> {
    for (const cart of this.carts.values()) {
      if (cart.tenantId === tenantId && cart.sessionId === sessionId) {
        return structuredClone(cart);
      }
    }
    return undefined;
  }
}
