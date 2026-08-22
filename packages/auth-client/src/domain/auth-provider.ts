import type { AuthMethodId, AuthSurface, ResolvedAuthPolicy } from '../types.js';

/**
 * Port for authentication providers (email, OAuth, SSO, magic link, etc.).
 * Task 1 defines the contract; Task 2+ supplies adapters.
 */
export interface AuthProvider {
  readonly id: AuthMethodId;
  readonly surfaces: readonly AuthSurface[];

  /** Return true when this provider can serve the given resolved policy. */
  supports(policy: ResolvedAuthPolicy): boolean;
}

/**
 * Port for persisting opaque auth tokens / session material.
 * Implementations: web secure storage, React Native keychain (Task 2+).
 */
export interface TokenStore {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Port for starting an interactive auth challenge (OAuth/PKCE, magic link, SSO).
 * Task 1 defines the contract only.
 */
export interface AuthChallengePort {
  readonly method: AuthMethodId;
  start(input: {
    tenantId?: string;
    surface: AuthSurface;
    redirectUri?: string;
  }): Promise<{ challengeId: string; authorizationUrl?: string }>;
}
