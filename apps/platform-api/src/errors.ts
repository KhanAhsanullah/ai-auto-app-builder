/** Base error for platform-api domain failures. */
export class PlatformApiException extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'PlatformApiException';
    this.statusCode = statusCode;
  }
}

export class BoomLaunchValidationException extends PlatformApiException {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BoomLaunchValidationException';
  }
}

export class TenantNotFoundException extends PlatformApiException {
  constructor(tenantId: string) {
    super(`Tenant '${tenantId}' was not found.`, 404);
    this.name = 'TenantNotFoundException';
  }
}
