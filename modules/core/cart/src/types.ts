/** Money amount in major units with an ISO-4217 currency code. */
export interface Money {
  amount: number;
  currency: string;
}

/** A single line in a shopping cart (variant-level). */
export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

/** Tenant-scoped shopping cart (guest session and/or customer). */
export interface Cart {
  tenantId: string;
  id: string;
  customerId?: string;
  sessionId?: string;
  currency: string;
  lines: readonly CartLine[];
  subtotal: Money;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating an empty cart. */
export interface CreateCartInput {
  tenantId: string;
  currency: string;
  customerId?: string;
  sessionId?: string;
  id?: string;
}

/** Input for adding a line (or increasing quantity for the same variant). */
export interface AddCartItemInput {
  tenantId: string;
  cartId: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  unitPrice: Money;
  /** Defaults to 1. */
  quantity?: number;
}

/** Input for setting an absolute line quantity (0 removes the line). */
export interface SetCartLineQuantityInput {
  tenantId: string;
  cartId: string;
  lineId: string;
  quantity: number;
}

/** Input for removing a line. */
export interface RemoveCartLineInput {
  tenantId: string;
  cartId: string;
  lineId: string;
}

/** Input for get-or-create by guest session. */
export interface GetOrCreateBySessionInput {
  tenantId: string;
  sessionId: string;
  currency: string;
  id?: string;
}

/** Input for get-or-create by customer. */
export interface GetOrCreateByCustomerInput {
  tenantId: string;
  customerId: string;
  currency: string;
  id?: string;
}

/** Add a line by catalog ids (requires CatalogProductLookup). */
export interface AddCartItemFromCatalogInput {
  tenantId: string;
  cartId: string;
  productId: string;
  variantId: string;
  /** Defaults to 1. */
  quantity?: number;
}
