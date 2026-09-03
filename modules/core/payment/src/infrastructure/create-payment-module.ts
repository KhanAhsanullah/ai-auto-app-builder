import type { OrderLookup } from '../domain/order-lookup.js';
import type { PaymentGatewayPort } from '../domain/payment-gateway.js';
import { PaymentModule } from '../domain/payment-module.js';
import type { PaymentRepository } from '../domain/payment-repository.js';
import { PaymentService } from '../domain/payment-service.js';
import { PaymentValidationException } from '../errors.js';
import { InMemoryPaymentRepository } from './in-memory-payment-repository.js';

export interface CreatePaymentModuleOptions {
  /** Required: adapt `@ai-commerce/module-order` (or a test stub). */
  orderLookup: OrderLookup;
  repository?: PaymentRepository;
  gateway?: PaymentGatewayPort;
  now?: () => string;
  createId?: () => string;
}

/**
 * Wire a PaymentModule with in-memory defaults (or injected ports).
 * `orderLookup` is required — intents are created from payable orders.
 */
export function createPaymentModule(options: CreatePaymentModuleOptions): PaymentModule {
  if (!options.orderLookup) {
    throw new PaymentValidationException(
      'createPaymentModule requires an OrderLookup (adapt module-order).',
    );
  }

  const repository = options.repository ?? new InMemoryPaymentRepository();
  const service = new PaymentService({
    repository,
    orderLookup: options.orderLookup,
    gateway: options.gateway,
    now: options.now,
    createId: options.createId,
  });
  return new PaymentModule({ service });
}
