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
