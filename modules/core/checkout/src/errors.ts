/** Base error for checkout module failures. */
export class CheckoutException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutException';
  }
}

/** Thrown when a checkout session cannot be found. */
export class CheckoutNotFoundException extends CheckoutException {
  readonly tenantId: string;
  readonly checkoutId: string;

  constructor(tenantId: string, checkoutId: string) {
    super(`Checkout '${checkoutId}' not found for tenant '${tenantId}'.`);
    this.name = 'CheckoutNotFoundException';
    this.tenantId = tenantId;
    this.checkoutId = checkoutId;
  }
}

/** Thrown when checkout input fails validation. */
export class CheckoutValidationException extends CheckoutException {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutValidationException';
  }
}

/** Thrown when cart lookup fails or cart is invalid for checkout. */
export class CheckoutCartException extends CheckoutException {
  readonly tenantId: string;
  readonly cartId: string;

  constructor(message: string, tenantId: string, cartId: string) {
    super(message);
    this.name = 'CheckoutCartException';
    this.tenantId = tenantId;
    this.cartId = cartId;
  }
}

/** Thrown when checkout status transition is invalid. */
export class CheckoutStatusException extends CheckoutException {
  readonly tenantId: string;
  readonly checkoutId: string;
  readonly status: string;

  constructor(message: string, tenantId: string, checkoutId: string, status: string) {
    super(message);
    this.name = 'CheckoutStatusException';
    this.tenantId = tenantId;
    this.checkoutId = checkoutId;
    this.status = status;
  }
}

/** Thrown when shipping method catalog lookup fails. */
export class CheckoutShippingException extends CheckoutException {
  readonly tenantId: string;
  readonly methodId?: string;

  constructor(message: string, tenantId: string, methodId?: string) {
    super(message);
    this.name = 'CheckoutShippingException';
    this.tenantId = tenantId;
    this.methodId = methodId;
  }
}
