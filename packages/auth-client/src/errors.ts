/** Base error for auth-client failures. */
export class AuthClientException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthClientException';
  }
}

/** Thrown when authentication config fails semantic policy validation. */
export class AuthPolicyValidationException extends AuthClientException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthPolicyValidationException';
  }
}

/** Thrown when auth policy resolution fails for a surface. */
export class AuthPolicyResolutionException extends AuthClientException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthPolicyResolutionException';
  }
}

/** Thrown when a requested auth method is not enabled for the surface. */
export class AuthMethodNotEnabledException extends AuthClientException {
  readonly surface: string;
  readonly method: string;

  constructor(surface: string, method: string) {
    super(`Auth method '${method}' is not enabled for surface '${surface}'.`);
    this.name = 'AuthMethodNotEnabledException';
    this.surface = surface;
    this.method = method;
  }
}

/** Thrown when an OAuth/PKCE/SSO/magic-link challenge is invalid or expired. */
export class AuthChallengeException extends AuthClientException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthChallengeException';
  }
}

/** Thrown when token exchange or refresh fails. */
export class AuthTokenException extends AuthClientException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthTokenException';
  }
}

/** Thrown when the AuthClient facade lacks a required flow adapter. */
export class AuthProviderNotConfiguredException extends AuthClientException {
  readonly method: string;

  constructor(method: string, message?: string) {
    super(message ?? `Auth provider '${method}' is not configured on AuthClient.`);
    this.name = 'AuthProviderNotConfiguredException';
    this.method = method;
  }
}
