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
