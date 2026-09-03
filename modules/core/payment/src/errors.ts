/** Base error for payment module failures. */
export class PaymentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentException';
  }
}

/** Thrown when a payment intent cannot be found. */
export class PaymentNotFoundException extends PaymentException {
  readonly tenantId: string;
  readonly paymentIntentId: string;

  constructor(tenantId: string, paymentIntentId: string) {
    super(`Payment intent '${paymentIntentId}' not found for tenant '${tenantId}'.`);
    this.name = 'PaymentNotFoundException';
    this.tenantId = tenantId;
    this.paymentIntentId = paymentIntentId;
  }
}

/** Thrown when payment input fails validation. */
export class PaymentValidationException extends PaymentException {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentValidationException';
  }
}

/** Thrown when order lookup fails or order is not payable. */
export class PaymentOrderException extends PaymentException {
  readonly tenantId: string;
  readonly orderId: string;

  constructor(message: string, tenantId: string, orderId: string) {
    super(message);
    this.name = 'PaymentOrderException';
    this.tenantId = tenantId;
    this.orderId = orderId;
  }
}

/** Thrown when payment status transition is invalid. */
export class PaymentStatusException extends PaymentException {
  readonly tenantId: string;
  readonly paymentIntentId: string;
  readonly status: string;

  constructor(message: string, tenantId: string, paymentIntentId: string, status: string) {
    super(message);
    this.name = 'PaymentStatusException';
    this.tenantId = tenantId;
    this.paymentIntentId = paymentIntentId;
    this.status = status;
  }
}
