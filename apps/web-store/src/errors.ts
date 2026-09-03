/** Base error for web store failures. */
export class WebStoreException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebStoreException';
  }
}

/** Thrown when web store shell resolution fails. */
export class WebStoreResolutionException extends WebStoreException {
  constructor(message: string) {
    super(message);
    this.name = 'WebStoreResolutionException';
  }
}

/** Thrown when catalog is not wired or disabled for the tenant. */
export class WebStoreCatalogUnavailableException extends WebStoreException {
  constructor(message: string) {
    super(message);
    this.name = 'WebStoreCatalogUnavailableException';
  }
}

/** Thrown when cart is not wired or disabled for the tenant. */
export class WebStoreCartUnavailableException extends WebStoreException {
  constructor(message: string) {
    super(message);
    this.name = 'WebStoreCartUnavailableException';
  }
}

/** Thrown when checkout is not wired or disabled for the tenant. */
export class WebStoreCheckoutUnavailableException extends WebStoreException {
  constructor(message: string) {
    super(message);
    this.name = 'WebStoreCheckoutUnavailableException';
  }
}

/** Thrown when order is not wired or disabled for the tenant. */
export class WebStoreOrderUnavailableException extends WebStoreException {
  constructor(message: string) {
    super(message);
    this.name = 'WebStoreOrderUnavailableException';
  }
}

/** Thrown when payment is not wired or disabled for the tenant. */
export class WebStorePaymentUnavailableException extends WebStoreException {
  constructor(message: string) {
    super(message);
    this.name = 'WebStorePaymentUnavailableException';
  }
}
