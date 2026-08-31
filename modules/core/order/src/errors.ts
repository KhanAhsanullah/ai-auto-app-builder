/** Base error for order module failures. */
export class OrderException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderException';
  }
}

/** Thrown when an order cannot be found. */
export class OrderNotFoundException extends OrderException {
  readonly tenantId: string;
  readonly orderId: string;

  constructor(tenantId: string, orderId: string) {
    super(`Order '${orderId}' not found for tenant '${tenantId}'.`);
    this.name = 'OrderNotFoundException';
    this.tenantId = tenantId;
    this.orderId = orderId;
  }
}

/** Thrown when order input fails validation. */
export class OrderValidationException extends OrderException {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationException';
  }
}

/** Thrown when checkout lookup fails or checkout is not ready for order. */
export class OrderCheckoutException extends OrderException {
  readonly tenantId: string;
  readonly checkoutId: string;

  constructor(message: string, tenantId: string, checkoutId: string) {
    super(message);
    this.name = 'OrderCheckoutException';
    this.tenantId = tenantId;
    this.checkoutId = checkoutId;
  }
}

/** Thrown when order status transition is invalid. */
export class OrderStatusException extends OrderException {
  readonly tenantId: string;
  readonly orderId: string;
  readonly status: string;

  constructor(message: string, tenantId: string, orderId: string, status: string) {
    super(message);
    this.name = 'OrderStatusException';
    this.tenantId = tenantId;
    this.orderId = orderId;
    this.status = status;
  }
}
