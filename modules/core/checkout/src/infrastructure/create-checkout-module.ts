import type { CartLookup } from '../domain/cart-lookup.js';
import { CheckoutModule } from '../domain/checkout-module.js';
import type { CheckoutRepository } from '../domain/checkout-repository.js';
import { CheckoutService } from '../domain/checkout-service.js';
import type { ShippingMethodCatalog } from '../domain/shipping-method-catalog.js';
import { CheckoutValidationException } from '../errors.js';
import { InMemoryCheckoutRepository } from './in-memory-checkout-repository.js';

export interface CreateCheckoutModuleOptions {
  /** Required: adapt `@ai-commerce/module-cart` (or a test stub). */
  cartLookup: CartLookup;
  repository?: CheckoutRepository;
  shippingCatalog?: ShippingMethodCatalog;
  now?: () => string;
  createId?: () => string;
}

/**
 * Wire a CheckoutModule with in-memory defaults (or injected ports).
 * `cartLookup` is required — checkout always starts from a cart snapshot.
 */
export function createCheckoutModule(options: CreateCheckoutModuleOptions): CheckoutModule {
  if (!options.cartLookup) {
    throw new CheckoutValidationException(
      'createCheckoutModule requires a CartLookup (adapt module-cart).',
    );
  }

  const repository = options.repository ?? new InMemoryCheckoutRepository();
  const service = new CheckoutService({
    repository,
    cartLookup: options.cartLookup,
    shippingCatalog: options.shippingCatalog,
    now: options.now,
    createId: options.createId,
  });
  return new CheckoutModule({ service });
}
