import type { Money } from '../types.js';

/** Order statuses that may receive a payment intent. */
export const PAYABLE_ORDER_STATUSES = ['placed', 'confirmed'] as const;

export type PayableOrderStatus = (typeof PAYABLE_ORDER_STATUSES)[number];

/** Order snapshot used to create a payment intent. */
export interface PayableOrderSnapshot {
  id: string;
  tenantId: string;
  checkoutId: string;
  currency: string;
  status: string;
  total: Money;
  customerId?: string;
}

/**
 * Port for loading an order (no hard dependency on module-order).
 * Host apps can adapt `@ai-commerce/module-order`.
 */
export interface OrderLookup {
  getOrder(tenantId: string, orderId: string): Promise<PayableOrderSnapshot | undefined>;
}

export function isPayableOrderStatus(status: string): status is PayableOrderStatus {
  return (PAYABLE_ORDER_STATUSES as readonly string[]).includes(status);
}
