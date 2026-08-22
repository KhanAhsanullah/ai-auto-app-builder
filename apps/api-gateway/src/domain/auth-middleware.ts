import type {
  AuthClient,
  AuthMethodId,
  AuthSurface,
  ResolvedAuthPolicy,
} from '@ai-commerce/auth-client';

import { AuthUnauthorizedException } from '../errors.js';
import type { GatewayAuthPrincipal, GatewayContext } from '../types.js';
import {
  extractCredentials,
  type ExtractedCredential,
  type ExtractedCredentialKind,
} from './credential-extractor.js';
import type { GatewayMiddleware } from './middleware-pipeline.js';

/**
 * Port for validating opaque credentials presented to the gateway.
 * Production adapters introspect IdP / session stores; tests use in-memory maps.
 */
export interface GatewayCredentialValidator {
  validate(input: {
    kind: ExtractedCredentialKind;
    credential: string;
    tenantId?: string;
    surface: AuthSurface;
    policy: ResolvedAuthPolicy;
  }): Promise<GatewayAuthPrincipal | undefined>;
}

export interface CreateAuthMiddlewareOptions {
  authClient: AuthClient;
  validator: GatewayCredentialValidator;
  /** Default surface when route does not set `authSurface`. Default `api`. */
  defaultSurface?: AuthSurface;
  /** Cookie name for session tokens. Default `cos_session`. */
  sessionCookieName?: string;
  /** Wall-clock for expiry checks (injectable for tests). */
  now?: () => number;
}

/**
 * Auth middleware: resolve surface policy via AuthClient, validate Bearer / session / API key.
 * Skips when the matched route has `requireAuth: false` (default).
 */
export function createAuthMiddleware(options: CreateAuthMiddlewareOptions): GatewayMiddleware {
  const defaultSurface = options.defaultSurface ?? 'api';
  const now = options.now ?? (() => Date.now());

  return async (context, next) => {
    const requireAuth = context.route?.route.requireAuth === true;
    if (!requireAuth) {
      return next();
    }

    const surface = context.route?.route.authSurface ?? defaultSurface;
    const policy = resolvePolicy(options.authClient, context, surface);

    const extracted = extractCredentials(context.request.headers, {
      sessionCookieName: options.sessionCookieName,
    });

    if (!extracted) {
      throw new AuthUnauthorizedException('Missing authentication credentials.');
    }

    assertCredentialAllowed(extracted, policy);

    const principal = await options.validator.validate({
      kind: extracted.kind,
      credential: extracted.value,
      tenantId: context.tenant?.id ?? policy.tenantId,
      surface,
      policy,
    });

    if (!principal) {
      throw new AuthUnauthorizedException('Invalid authentication credentials.');
    }

    if (principal.surface !== surface) {
      throw new AuthUnauthorizedException(
        `Credential surface '${principal.surface}' does not match required '${surface}'.`,
      );
    }

    if (principal.expiresAt !== undefined && principal.expiresAt <= now()) {
      throw new AuthUnauthorizedException('Authentication credentials have expired.');
    }

    if (!policy.enabledMethods.includes(principal.method)) {
      throw new AuthUnauthorizedException(
        `Auth method '${principal.method}' is not enabled for surface '${surface}'.`,
      );
    }

    context.auth = principal;
    return next();
  };
}

function resolvePolicy(
  authClient: AuthClient,
  context: GatewayContext,
  surface: AuthSurface,
): ResolvedAuthPolicy {
  const config = context.config?.config;
  if (!config?.authentication) {
    throw new AuthUnauthorizedException(
      'Tenant authentication configuration is required for authenticated routes.',
    );
  }

  return authClient.resolvePolicyFromConfigProvider(
    {
      config: {
        authentication: config.authentication,
        tenant: config.tenant,
      },
    },
    surface,
  );
}

function assertCredentialAllowed(
  credential: ExtractedCredential,
  policy: ResolvedAuthPolicy,
): void {
  if (credential.kind === 'api_key') {
    if (!policy.enabledMethods.includes('api_key') && !policy.api?.enabled) {
      throw new AuthUnauthorizedException('API key authentication is not enabled for this tenant.');
    }
    return;
  }

  // Bearer / session require at least one interactive or token-bearing method on the surface.
  const sessionCapable = policy.enabledMethods.some((method) => isSessionCapableMethod(method));
  if (!sessionCapable) {
    throw new AuthUnauthorizedException(
      `No session-capable auth methods are enabled for surface '${policy.surface}'.`,
    );
  }
}

function isSessionCapableMethod(method: AuthMethodId): boolean {
  return (
    method === 'email' ||
    method === 'phone' ||
    method === 'guest' ||
    method === 'google' ||
    method === 'apple' ||
    method === 'facebook' ||
    method === 'sso' ||
    method === 'client_credentials'
  );
}
