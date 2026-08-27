/** Money amount in major units with an ISO-4217 currency code. */
export interface Money {
  amount: number;
  currency: string;
}

/** Checkout session lifecycle status. */
export type CheckoutStatus =
  'draft' | 'address_collected' | 'shipping_selected' | 'completed' | 'cancelled';

/** Snapshot of a cart line at checkout start. */
export interface CheckoutLineItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

/** Shipping address collected during checkout. */
export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
}

/** Selected shipping method with price. */
export interface ShippingMethod {
  id: string;
  name: string;
  price: Money;
}

/** Tenant-scoped checkout session started from a cart. */
export interface CheckoutSession {
  tenantId: string;
  id: string;
  cartId: string;
  status: CheckoutStatus;
  currency: string;
  lines: readonly CheckoutLineItem[];
  subtotal: Money;
  shipping?: Money;
  total: Money;
  shippingAddress?: ShippingAddress;
  shippingMethod?: ShippingMethod;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** Input for starting checkout from a cart. */
export interface StartCheckoutInput {
  tenantId: string;
  cartId: string;
  id?: string;
}

/** Input for updating shipping address. */
export interface UpdateShippingAddressInput {
  tenantId: string;
  checkoutId: string;
  address: ShippingAddress;
}

/** Input for selecting a shipping method. */
export interface SelectShippingMethodInput {
  tenantId: string;
  checkoutId: string;
  method: ShippingMethod;
}
