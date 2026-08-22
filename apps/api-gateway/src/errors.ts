/** Base error for API gateway failures. */
export class ApiGatewayException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiGatewayException';
  }
}

/** Thrown when tenant identity cannot be resolved for a tenant-scoped route. */
export class TenantResolutionException extends ApiGatewayException {
  constructor(message: string) {
    super(message);
    this.name = 'TenantResolutionException';
  }
}

/** Thrown when no route matches the inbound request. */
export class RouteNotFoundException extends ApiGatewayException {
  readonly method: string;
  readonly path: string;

  constructor(method: string, path: string) {
    super(`No gateway route matches ${method} ${path}.`);
    this.name = 'RouteNotFoundException';
    this.method = method;
    this.path = path;
  }
}

/** Thrown when a client exceeds the configured rate limit. */
export class RateLimitExceededException extends ApiGatewayException {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super('Rate limit exceeded.');
    this.name = 'RateLimitExceededException';
    this.retryAfterMs = retryAfterMs;
  }
}

/** Thrown when tenant config injection / resolution fails. */
export class ConfigInjectionException extends ApiGatewayException {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigInjectionException';
  }
}

/** Thrown when authentication is required but missing or invalid. */
export class AuthUnauthorizedException extends ApiGatewayException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthUnauthorizedException';
  }
}
