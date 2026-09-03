import type { PaymentService } from './payment-service.js';
import type {
  CreatePaymentIntentInput,
  ListPaymentIntentsOptions,
  PaymentIntent,
} from '../types.js';

export interface PaymentModuleDeps {
  service: PaymentService;
}

/**
 * Public facade for tenant payments: create intent, status, and queries.
 */
export class PaymentModule {
  constructor(private readonly deps: PaymentModuleDeps) {}

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return this.deps.service.createPaymentIntent(input);
  }

  async getPaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    return this.deps.service.getPaymentIntent(tenantId, paymentIntentId);
  }

  async getPaymentIntentByOrderId(tenantId: string, orderId: string): Promise<PaymentIntent> {
    return this.deps.service.getPaymentIntentByOrderId(tenantId, orderId);
  }

  async listPaymentIntents(
    tenantId: string,
    options?: ListPaymentIntentsOptions,
  ): Promise<PaymentIntent[]> {
    return this.deps.service.listPaymentIntents(tenantId, options);
  }

  async listPaymentIntentsByOrder(tenantId: string, orderId: string): Promise<PaymentIntent[]> {
    return this.deps.service.listPaymentIntentsByOrder(tenantId, orderId);
  }

  async authorizePaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    return this.deps.service.authorizePaymentIntent(tenantId, paymentIntentId);
  }

  async capturePaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    return this.deps.service.capturePaymentIntent(tenantId, paymentIntentId);
  }

  async failPaymentIntent(
    tenantId: string,
    paymentIntentId: string,
    reason?: string,
  ): Promise<PaymentIntent> {
    return this.deps.service.failPaymentIntent(tenantId, paymentIntentId, reason);
  }

  async cancelPaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    return this.deps.service.cancelPaymentIntent(tenantId, paymentIntentId);
  }
}
