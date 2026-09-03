import type { CheckoutLookup } from '../domain/checkout-lookup.js';
import { OrderModule } from '../domain/order-module.js';
import type { OrderRepository } from '../domain/order-repository.js';
import { OrderService } from '../domain/order-service.js';
import { OrderValidationException } from '../errors.js';
import { InMemoryOrderRepository } from './in-memory-order-repository.js';

export interface CreateOrderModuleOptions {
  /** Required: adapt `@ai-commerce/module-checkout` (or a test stub). */
  checkoutLookup: CheckoutLookup;
  repository?: OrderRepository;
  now?: () => string;
  createId?: () => string;
}

/**
 * Wire an OrderModule with in-memory defaults (or injected ports).
 * `checkoutLookup` is required — orders are created from completed checkouts.
 */
export function createOrderModule(options: CreateOrderModuleOptions): OrderModule {
  if (!options.checkoutLookup) {
    throw new OrderValidationException(
      'createOrderModule requires a CheckoutLookup (adapt module-checkout).',
    );
  }

  const repository = options.repository ?? new InMemoryOrderRepository();
  const service = new OrderService({
    repository,
    checkoutLookup: options.checkoutLookup,
    now: options.now,
    createId: options.createId,
  });
  return new OrderModule({ service });
}
