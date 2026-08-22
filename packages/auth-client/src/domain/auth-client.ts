import type { Authentication } from '@ai-commerce/config-schema';

import type {
  AuthChallengeStartResult,
  AuthTokenSet,
  OAuthClientConfig,
} from './auth-flow-types.js';
import type { AuthPolicyResolver } from './auth-policy-resolver.js';
import type { AuthProvider, TokenStore } from './auth-provider.js';
import type { AuthProviderRegistry } from './auth-provider-registry.js';
import type { MagicLinkProvider } from './magic-link-provider.js';
import {
  authConfigSourceFromProviderResult,
  toResolveAuthPolicyInput,
  type ConfigProviderAuthInput,
} from './map-config-auth-source.js';
import type { OAuthPkceProvider } from './oauth-pkce-provider.js';
import type { SsoChallengeProvider } from './sso-challenge-provider.js';
import {
  listEnabledMethodsBySurface,
  resolveAllSurfacePolicies,
  sessionStorageKey,
  type MultiSurfaceAuthPolicies,
} from './surface-auth-helpers.js';
import type { TokenRefreshService } from './token-refresh-service.js';
import {
  AuthMethodNotEnabledException,
  AuthProviderNotConfiguredException,
  AuthTokenException,
} from '../errors.js';
import type { AuthConfigSource, AuthMethodId, AuthSurface, ResolvedAuthPolicy } from '../types.js';

const SOCIAL_METHODS = new Set<AuthMethodId>(['google', 'apple', 'facebook']);

export interface AuthClientDeps {
  policyResolver: AuthPolicyResolver;
  providerRegistry: AuthProviderRegistry;
  tokenStore: TokenStore;
  oauthProviders: ReadonlyMap<AuthMethodId, OAuthPkceProvider>;
  magicLinkProvider?: MagicLinkProvider;
  ssoProvider?: SsoChallengeProvider;
  tokenRefreshService?: TokenRefreshService;
  /** OIDC client config supplier for SSO complete (same as start resolver). */
  resolveSsoClientConfig?: (
    policy: ResolvedAuthPolicy,
  ) => OAuthClientConfig | Promise<OAuthClientConfig>;
}

/**
 * Public facade for auth policy resolution, interactive flows, and session tokens.
 * Orchestrates Task 1–2 modules; individual adapters remain usable directly.
 */
export class AuthClient {
  constructor(private readonly deps: AuthClientDeps) {}

  /** Resolve a single surface policy from authentication config. */
  resolvePolicy(
    authentication: Authentication,
    surface: AuthSurface,
    tenantId?: string,
  ): ResolvedAuthPolicy {
    return this.deps.policyResolver.resolve({ authentication, surface, tenantId });
  }

  /** Resolve policies for customer, admin, and api surfaces. */
  resolveAllPolicies(authentication: Authentication, tenantId?: string): MultiSurfaceAuthPolicies {
    return resolveAllSurfacePolicies(this.deps.policyResolver, authentication, tenantId);
  }

  /** Map ConfigProvider output to a surface policy without re-resolving config. */
  resolvePolicyFromConfigProvider(
    result: ConfigProviderAuthInput,
    surface: AuthSurface,
  ): ResolvedAuthPolicy {
    const source = authConfigSourceFromProviderResult(result);
    return this.deps.policyResolver.resolve(toResolveAuthPolicyInput(source, surface));
  }

  /** Resolve from an AuthConfigSource. */
  resolvePolicyFromSource(source: AuthConfigSource, surface: AuthSurface): ResolvedAuthPolicy {
    return this.deps.policyResolver.resolve(toResolveAuthPolicyInput(source, surface));
  }

  /** List enabled methods across all surfaces. */
  listEnabledMethods(
    authentication: Authentication,
    tenantId?: string,
  ): ReadonlyArray<{ surface: AuthSurface; method: AuthMethodId }> {
    return listEnabledMethodsBySurface(this.resolveAllPolicies(authentication, tenantId));
  }

  /** Register an additional AuthProvider on the process registry. */
  registerProvider(provider: AuthProvider): void {
    this.deps.providerRegistry.register(provider);
  }

  /** Providers registered for a resolved policy. */
  providersForPolicy(policy: ResolvedAuthPolicy): AuthProvider[] {
    return this.deps.providerRegistry.resolveForPolicy(policy);
  }

  /** Start an OAuth/PKCE challenge for a social method. */
  async startOAuth(input: {
    authentication: Authentication;
    method: 'google' | 'apple' | 'facebook';
    surface: AuthSurface;
    redirectUri: string;
    tenantId?: string;
  }): Promise<AuthChallengeStartResult> {
    const policy = this.resolvePolicy(input.authentication, input.surface, input.tenantId);
    if (!policy.enabledMethods.includes(input.method)) {
      throw new AuthMethodNotEnabledException(input.surface, input.method);
    }

    const provider = this.requireOAuthProvider(input.method);
    return provider.start({
      surface: input.surface,
      redirectUri: input.redirectUri,
      tenantId: input.tenantId,
    });
  }

  /** Complete an OAuth/PKCE challenge and optionally persist the session. */
  async completeOAuth(input: {
    method: 'google' | 'apple' | 'facebook';
    challengeId: string;
    code: string;
    state: string;
    surface?: AuthSurface;
    persist?: boolean;
  }): Promise<AuthTokenSet> {
    const provider = this.requireOAuthProvider(input.method);
    const tokens = await provider.complete({
      challengeId: input.challengeId,
      code: input.code,
      state: input.state,
    });

    if (input.persist !== false && input.surface) {
      await this.saveSession(input.surface, tokens);
    }

    return tokens;
  }

  /** Start an email magic-link challenge. */
  async startMagicLink(input: {
    authentication: Authentication;
    email: string;
    surface: AuthSurface;
    tenantId?: string;
  }): Promise<AuthChallengeStartResult> {
    const policy = this.resolvePolicy(input.authentication, input.surface, input.tenantId);
    if (!policy.enabledMethods.includes('email')) {
      throw new AuthMethodNotEnabledException(input.surface, 'email');
    }

    const provider = this.requireMagicLinkProvider();
    return provider.start({
      email: input.email,
      surface: input.surface,
      tenantId: input.tenantId,
    });
  }

  /** Complete a magic-link challenge and optionally persist the session. */
  async completeMagicLink(input: {
    challengeId: string;
    confirmationToken: string;
    surface?: AuthSurface;
    persist?: boolean;
  }): Promise<AuthTokenSet> {
    const provider = this.requireMagicLinkProvider();
    const tokens = await provider.complete({
      challengeId: input.challengeId,
      confirmationToken: input.confirmationToken,
    });

    if (input.persist !== false && input.surface) {
      await this.saveSession(input.surface, tokens);
    }

    return tokens;
  }

  /** Start an admin SSO challenge. */
  async startSso(input: {
    authentication: Authentication;
    redirectUri: string;
    tenantId?: string;
  }): Promise<AuthChallengeStartResult> {
    const policy = this.resolvePolicy(input.authentication, 'admin', input.tenantId);
    if (!policy.enabledMethods.includes('sso')) {
      throw new AuthMethodNotEnabledException('admin', 'sso');
    }

    const provider = this.requireSsoProvider();
    return provider.start({
      policy,
      redirectUri: input.redirectUri,
      tenantId: input.tenantId,
    });
  }

  /** Complete an OIDC SSO code exchange. */
  async completeSsoOidc(input: {
    authentication: Authentication;
    challengeId: string;
    code: string;
    state: string;
    persist?: boolean;
    tenantId?: string;
  }): Promise<AuthTokenSet> {
    const policy = this.resolvePolicy(input.authentication, 'admin', input.tenantId);
    const provider = this.requireSsoProvider();
    if (!this.deps.resolveSsoClientConfig) {
      throw new AuthProviderNotConfiguredException(
        'sso',
        'SSO client config resolver is not configured on AuthClient.',
      );
    }

    const client = await this.deps.resolveSsoClientConfig(policy);
    const tokens = await provider.completeOidc({
      challengeId: input.challengeId,
      code: input.code,
      state: input.state,
      client,
    });

    if (input.persist !== false) {
      await this.saveSession('admin', tokens);
    }

    return tokens;
  }

  /** Complete a SAML SSO assertion handoff. */
  async completeSsoSaml(input: {
    challengeId: string;
    state: string;
    assertionId: string;
    persist?: boolean;
  }): Promise<AuthTokenSet> {
    const provider = this.requireSsoProvider();
    const tokens = await provider.completeSaml(input);

    if (input.persist !== false) {
      await this.saveSession('admin', tokens);
    }

    return tokens;
  }

  /** Persist tokens for a surface. */
  async saveSession(surface: AuthSurface, tokens: AuthTokenSet): Promise<void> {
    await this.deps.tokenStore.set(sessionStorageKey(surface), JSON.stringify(tokens));
  }

  /** Load tokens for a surface (no refresh). */
  async getSession(surface: AuthSurface): Promise<AuthTokenSet | undefined> {
    const raw = await this.deps.tokenStore.get(sessionStorageKey(surface));
    if (!raw) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as AuthTokenSet;
    } catch {
      throw new AuthTokenException(`Stored session for surface '${surface}' is not valid JSON.`);
    }
  }

  /** Clear tokens for a surface. */
  async clearSession(surface: AuthSurface): Promise<void> {
    await this.deps.tokenStore.delete(sessionStorageKey(surface));
  }

  /**
   * Load surface session and refresh when near expiry (requires TokenRefreshService).
   */
  async ensureFreshSession(input: {
    authentication: Authentication;
    surface: AuthSurface;
    tenantId?: string;
  }): Promise<AuthTokenSet | undefined> {
    const policy = this.resolvePolicy(input.authentication, input.surface, input.tenantId);
    const refresh = this.deps.tokenRefreshService;
    if (!refresh) {
      return this.getSession(input.surface);
    }

    return refresh.ensureFreshInStore(
      this.deps.tokenStore,
      policy.session,
      sessionStorageKey(input.surface),
    );
  }

  /** Whether a method id is a social OAuth method. */
  static isSocialMethod(method: AuthMethodId): boolean {
    return SOCIAL_METHODS.has(method);
  }

  private requireOAuthProvider(method: AuthMethodId): OAuthPkceProvider {
    const provider = this.deps.oauthProviders.get(method);
    if (!provider) {
      throw new AuthProviderNotConfiguredException(method);
    }
    return provider;
  }

  private requireMagicLinkProvider(): MagicLinkProvider {
    if (!this.deps.magicLinkProvider) {
      throw new AuthProviderNotConfiguredException('email', 'MagicLinkProvider is not configured.');
    }
    return this.deps.magicLinkProvider;
  }

  private requireSsoProvider(): SsoChallengeProvider {
    if (!this.deps.ssoProvider) {
      throw new AuthProviderNotConfiguredException('sso');
    }
    return this.deps.ssoProvider;
  }
}
