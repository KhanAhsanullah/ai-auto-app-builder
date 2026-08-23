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
