import type { PaymentIntent, PaymentIntentStatus } from '../types.js';

/** Persistence port for tenant-scoped payment intents. */
export interface PaymentRepository {
  save(intent: PaymentIntent): Promise<void>;
  update(intent: PaymentIntent): Promise<void>;
  findById(tenantId: string, paymentIntentId: string): Promise<PaymentIntent | undefined>;
  findByOrderId(tenantId: string, orderId: string): Promise<PaymentIntent | undefined>;
  listByTenant(tenantId: string): Promise<PaymentIntent[]>;
  listByOrderId(tenantId: string, orderId: string): Promise<PaymentIntent[]>;
  listByStatus(tenantId: string, status: PaymentIntentStatus): Promise<PaymentIntent[]>;
}
