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
