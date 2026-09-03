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
