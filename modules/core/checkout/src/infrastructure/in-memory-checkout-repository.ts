import type { CheckoutRepository } from '../domain/checkout-repository.js';
import { CheckoutException, CheckoutNotFoundException } from '../errors.js';
import type { CheckoutSession } from '../types.js';

function sessionKey(tenantId: string, checkoutId: string): string {
  return `${tenantId}::${checkoutId}`;
}

/** In-memory CheckoutRepository for tests and local development. */
export class InMemoryCheckoutRepository implements CheckoutRepository {
  private readonly sessions = new Map<string, CheckoutSession>();

  async save(session: CheckoutSession): Promise<void> {
    const key = sessionKey(session.tenantId, session.id);
    if (this.sessions.has(key)) {
      throw new CheckoutException(
        `Checkout '${session.id}' already exists for tenant '${session.tenantId}'.`,
      );
    }
    this.sessions.set(key, structuredClone(session));
  }

  async update(session: CheckoutSession): Promise<void> {
    const key = sessionKey(session.tenantId, session.id);
    if (!this.sessions.has(key)) {
      throw new CheckoutNotFoundException(session.tenantId, session.id);
    }
    this.sessions.set(key, structuredClone(session));
  }

  async findById(tenantId: string, checkoutId: string): Promise<CheckoutSession | undefined> {
    const found = this.sessions.get(sessionKey(tenantId, checkoutId));
    return found ? structuredClone(found) : undefined;
  }

  async findByCartId(tenantId: string, cartId: string): Promise<CheckoutSession | undefined> {
    for (const session of this.sessions.values()) {
      if (session.tenantId === tenantId && session.cartId === cartId) {
        return structuredClone(session);
      }
    }
    return undefined;
  }

  async listByTenant(tenantId: string): Promise<CheckoutSession[]> {
    return [...this.sessions.values()]
      .filter((session) => session.tenantId === tenantId)
      .map((session) => structuredClone(session));
  }
}
