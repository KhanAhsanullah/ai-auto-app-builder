/** Money amount in major units with an ISO-4217 currency code. */
export interface Money {
  amount: number;
  currency: string;
}

/** Order lifecycle status (thin slice — Task 1). */
export type OrderStatus = 'placed' | 'cancelled';

/** Snapshot of a line at order creation. */
export interface OrderLineItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

/** Shipping address copied from completed checkout. */
export interface OrderShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
}

/** Shipping method copied from completed checkout. */
export interface OrderShippingMethod {
  id: string;
  name: string;
  price: Money;
}

/** Tenant-scoped order created from a completed checkout. */
export interface Order {
  tenantId: string;
  id: string;
  checkoutId: string;
  cartId: string;
  status: OrderStatus;
  currency: string;
  lines: readonly OrderLineItem[];
  subtotal: Money;
  shipping: Money;
  total: Money;
  shippingAddress: OrderShippingAddress;
  shippingMethod: OrderShippingMethod;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

/** Input for creating an order from a completed checkout. */
export interface CreateOrderFromCheckoutInput {
  tenantId: string;
  checkoutId: string;
  id?: string;
}
