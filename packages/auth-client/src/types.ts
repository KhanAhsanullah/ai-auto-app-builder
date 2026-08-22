import type { Authentication } from '@ai-commerce/config-schema';

/** Auth surfaces that consume tenant authentication configuration. */
export type AuthSurface = 'customer' | 'admin' | 'api';

/**
 * Canonical auth method identifiers derived from the authentication schema.
 * Magic-link and password flows are implementations of `email` (Task 2+).
 */
export type AuthMethodId =
  | 'email'
  | 'phone'
  | 'guest'
  | 'google'
  | 'apple'
  | 'facebook'
  | 'sso'
  | 'api_key'
  | 'client_credentials';

/** MFA method identifiers from the authentication schema. */
export type MfaMethodId = 'totp' | 'sms' | 'email';

/** Admin SSO provider identifiers. */
export type SsoProviderId = 'saml' | 'oidc';

/** Admin RBAC default role identifiers. */
export type AdminRoleId = 'owner' | 'admin' | 'manager' | 'staff' | 'support';

/** Session policy resolved for a surface. */
export interface ResolvedSessionPolicy {
  tokenTtlMinutes: number;
  refreshEnabled: boolean;
  maxDevices?: number;
  idleTimeoutMinutes?: number;
}

/** MFA policy resolved for a surface (absent when not configured). */
export interface ResolvedMfaPolicy {
  required: boolean;
  methods: readonly MfaMethodId[];
}

/** Admin SSO policy when enabled. */
export interface ResolvedSsoPolicy {
  enabled: true;
  provider: SsoProviderId;
  issuerUrl: string;
}

/** API auth policy when the api section is present. */
export interface ResolvedApiAuthPolicy {
  enabled: boolean;
  keyRotationDays: number;
  oauthClientCredentials: boolean;
}

/** Fully resolved, surface-scoped authentication policy. */
export interface ResolvedAuthPolicy {
  tenantId?: string;
  surface: AuthSurface;
  enabledMethods: readonly AuthMethodId[];
  session: ResolvedSessionPolicy;
  mfa?: ResolvedMfaPolicy;
  sso?: ResolvedSsoPolicy;
  api?: ResolvedApiAuthPolicy;
  defaultRoles?: readonly AdminRoleId[];
}

/** Input for resolving a surface auth policy from tenant authentication config. */
export interface ResolveAuthPolicyInput {
  authentication: Authentication;
  surface: AuthSurface;
  tenantId?: string;
}

/** Structural auth config source mapped from Config Runtime without re-resolution. */
export interface AuthConfigSource {
  readonly config: Readonly<{
    authentication: Authentication;
    tenant?: { id?: string };
  }>;
}
