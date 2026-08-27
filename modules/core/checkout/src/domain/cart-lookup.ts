import type { CheckoutLineItem, Money } from '../types.js';

/** Cart snapshot used to start checkout (no hard dependency on module-cart). */
export interface CartSnapshot {
  id: string;
  tenantId: string;
  currency: string;
  subtotal: Money;
  lines: readonly CheckoutLineItem[];
}

/**
 * Optional port for loading a cart when starting checkout.
 * Host apps can adapt `@ai-commerce/module-cart`.
 */
export interface CartLookup {
  getCart(tenantId: string, cartId: string): Promise<CartSnapshot | undefined>;
}
