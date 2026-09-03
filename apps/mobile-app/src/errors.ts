/** Base error for mobile app failures. */
export class MobileAppException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppException';
  }
}

/** Thrown when mobile app shell resolution fails. */
export class MobileAppResolutionException extends MobileAppException {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppResolutionException';
  }
}

/** Thrown when catalog is not wired or disabled for the tenant. */
export class MobileAppCatalogUnavailableException extends MobileAppException {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppCatalogUnavailableException';
  }
}

/** Thrown when cart is not wired or disabled for the tenant. */
export class MobileAppCartUnavailableException extends MobileAppException {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppCartUnavailableException';
  }
}

/** Thrown when checkout is not wired or disabled for the tenant. */
export class MobileAppCheckoutUnavailableException extends MobileAppException {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppCheckoutUnavailableException';
  }
}

/** Thrown when order is not wired or disabled for the tenant. */
export class MobileAppOrderUnavailableException extends MobileAppException {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppOrderUnavailableException';
  }
}

/** Thrown when payment is not wired or disabled for the tenant. */
export class MobileAppPaymentUnavailableException extends MobileAppException {
  constructor(message: string) {
    super(message);
    this.name = 'MobileAppPaymentUnavailableException';
  }
}
