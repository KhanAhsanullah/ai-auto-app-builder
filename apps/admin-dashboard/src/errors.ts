/** Base error for admin dashboard failures. */
export class AdminDashboardException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardException';
  }
}

/** Thrown when admin dashboard shell resolution fails. */
export class AdminDashboardResolutionException extends AdminDashboardException {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardResolutionException';
  }
}

/** Thrown when catalog is not wired or disabled for the tenant. */
export class AdminDashboardCatalogUnavailableException extends AdminDashboardException {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardCatalogUnavailableException';
  }
}

/** Thrown when cart is not wired or disabled for the tenant. */
export class AdminDashboardCartUnavailableException extends AdminDashboardException {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardCartUnavailableException';
  }
}

/** Thrown when checkout is not wired or disabled for the tenant. */
export class AdminDashboardCheckoutUnavailableException extends AdminDashboardException {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardCheckoutUnavailableException';
  }
}

/** Thrown when order is not wired or disabled for the tenant. */
export class AdminDashboardOrderUnavailableException extends AdminDashboardException {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardOrderUnavailableException';
  }
}

/** Thrown when payment is not wired or disabled for the tenant. */
export class AdminDashboardPaymentUnavailableException extends AdminDashboardException {
  constructor(message: string) {
    super(message);
    this.name = 'AdminDashboardPaymentUnavailableException';
  }
}
