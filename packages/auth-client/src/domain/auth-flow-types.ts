import type { AuthMethodId, AuthSurface, SsoProviderId } from '../types.js';

/** Opaque access/refresh token set returned by auth flows. */
export interface AuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  /** Absolute expiry time in epoch milliseconds. */
  expiresAt: number;
  tokenType?: string;
  idToken?: string;
}

/** OAuth/OIDC client configuration for authorization-code + PKCE. */
export interface OAuthClientConfig {
  clientId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scopes?: readonly string[];
  /** Extra authorization query params (e.g. prompt, access_type). */
  extraAuthParams?: Record<string, string>;
}

/** Persisted PKCE challenge awaiting callback completion. */
export interface PkceChallengeRecord {
  challengeId: string;
  method: AuthMethodId;
  surface: AuthSurface;
  tenantId?: string;
  redirectUri: string;
  codeVerifier: string;
  state: string;
  createdAt: number;
}

/** Result of starting an interactive challenge. */
export interface AuthChallengeStartResult {
  challengeId: string;
  authorizationUrl?: string;
  state?: string;
}

/** Magic-link challenge awaiting email token completion. */
export interface MagicLinkChallengeRecord {
  challengeId: string;
  surface: AuthSurface;
  tenantId?: string;
  email: string;
  createdAt: number;
}

/** SSO challenge awaiting IdP callback. */
export interface SsoChallengeRecord {
  challengeId: string;
  surface: 'admin';
  tenantId?: string;
  provider: SsoProviderId;
  issuerUrl: string;
  redirectUri: string;
  state: string;
  codeVerifier?: string;
  createdAt: number;
}
