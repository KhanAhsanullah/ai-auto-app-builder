import type { Money, OrderLineItem, OrderShippingAddress, OrderShippingMethod } from '../types.js';

/** Completed checkout snapshot used to create an order. */
export interface CompletedCheckoutSnapshot {
  id: string;
  tenantId: string;
  cartId: string;
  currency: string;
  status: string;
  lines: readonly OrderLineItem[];
  subtotal: Money;
  shipping: Money;
  total: Money;
  shippingAddress: OrderShippingAddress;
  shippingMethod: OrderShippingMethod;
  completedAt?: string;
}

/**
 * Port for loading a completed checkout (no hard dependency on module-checkout).
 * Host apps can adapt `@ai-commerce/module-checkout`.
 */
export interface CheckoutLookup {
  getCheckout(tenantId: string, checkoutId: string): Promise<CompletedCheckoutSnapshot | undefined>;
}
