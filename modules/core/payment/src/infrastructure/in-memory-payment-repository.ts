import type { PaymentRepository } from '../domain/payment-repository.js';
import { PaymentException, PaymentNotFoundException } from '../errors.js';
import type { PaymentIntent, PaymentIntentStatus } from '../types.js';

function intentKey(tenantId: string, paymentIntentId: string): string {
  return `${tenantId}::${paymentIntentId}`;
}

/** In-memory PaymentRepository for tests and local development. */
export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly intents = new Map<string, PaymentIntent>();

  async save(intent: PaymentIntent): Promise<void> {
    const key = intentKey(intent.tenantId, intent.id);
    if (this.intents.has(key)) {
      throw new PaymentException(
        `Payment intent '${intent.id}' already exists for tenant '${intent.tenantId}'.`,
      );
    }
    this.intents.set(key, structuredClone(intent));
  }

  async update(intent: PaymentIntent): Promise<void> {
    const key = intentKey(intent.tenantId, intent.id);
    if (!this.intents.has(key)) {
      throw new PaymentNotFoundException(intent.tenantId, intent.id);
    }
    this.intents.set(key, structuredClone(intent));
  }

  async findById(tenantId: string, paymentIntentId: string): Promise<PaymentIntent | undefined> {
    const found = this.intents.get(intentKey(tenantId, paymentIntentId));
    return found ? structuredClone(found) : undefined;
  }

  async findByOrderId(tenantId: string, orderId: string): Promise<PaymentIntent | undefined> {
    for (const intent of this.intents.values()) {
      if (intent.tenantId === tenantId && intent.orderId === orderId) {
        return structuredClone(intent);
      }
    }
    return undefined;
  }

  async listByTenant(tenantId: string): Promise<PaymentIntent[]> {
    return [...this.intents.values()]
      .filter((intent) => intent.tenantId === tenantId)
      .map((intent) => structuredClone(intent));
  }

  async listByOrderId(tenantId: string, orderId: string): Promise<PaymentIntent[]> {
    return [...this.intents.values()]
      .filter((intent) => intent.tenantId === tenantId && intent.orderId === orderId)
      .map((intent) => structuredClone(intent));
  }

  async listByStatus(tenantId: string, status: PaymentIntentStatus): Promise<PaymentIntent[]> {
    return [...this.intents.values()]
      .filter((intent) => intent.tenantId === tenantId && intent.status === status)
      .map((intent) => structuredClone(intent));
  }
}
