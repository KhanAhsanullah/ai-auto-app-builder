/** Base error for cart module failures. */
export class CartException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CartException';
  }
}

/** Thrown when a cart cannot be found. */
export class CartNotFoundException extends CartException {
  readonly tenantId: string;
  readonly cartId: string;

  constructor(tenantId: string, cartId: string) {
    super(`Cart '${cartId}' not found for tenant '${tenantId}'.`);
    this.name = 'CartNotFoundException';
    this.tenantId = tenantId;
    this.cartId = cartId;
  }
}

/** Thrown when a cart line cannot be found. */
export class CartLineNotFoundException extends CartException {
  readonly tenantId: string;
  readonly cartId: string;
  readonly lineId: string;

  constructor(tenantId: string, cartId: string, lineId: string) {
    super(`Cart line '${lineId}' not found in cart '${cartId}' for tenant '${tenantId}'.`);
    this.name = 'CartLineNotFoundException';
    this.tenantId = tenantId;
    this.cartId = cartId;
    this.lineId = lineId;
  }
}

/** Thrown when cart input fails validation. */
export class CartValidationException extends CartException {
  constructor(message: string) {
    super(message);
    this.name = 'CartValidationException';
  }
}
