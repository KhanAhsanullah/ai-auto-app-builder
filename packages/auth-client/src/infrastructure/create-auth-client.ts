import { AuthPolicyResolver } from '../domain/auth-policy-resolver.js';
import { AuthClient } from '../domain/auth-client.js';
import { AuthProviderRegistry } from '../domain/auth-provider-registry.js';
import type { AuthProvider, TokenStore } from '../domain/auth-provider.js';
import type { OAuthClientConfig } from '../domain/auth-flow-types.js';
import { MagicLinkProvider } from '../domain/magic-link-provider.js';
import { OAuthPkceProvider } from '../domain/oauth-pkce-provider.js';
import type { HttpJsonClient, MagicLinkDeliveryPort } from '../domain/ports.js';
import { SsoChallengeProvider } from '../domain/sso-challenge-provider.js';
import type { SsoChallengeProviderOptions } from '../domain/sso-challenge-provider.js';
import { TokenRefreshService } from '../domain/token-refresh-service.js';
import type { AuthMethodId, ResolvedAuthPolicy, ResolvedSsoPolicy } from '../types.js';
import { InMemoryPkceChallengeStore } from './in-memory-pkce-challenge-store.js';
import { InMemoryTokenStore } from './in-memory-token-store.js';

export type SocialOAuthMethod = 'google' | 'apple' | 'facebook';

export interface CreateAuthClientOptions {
  tokenStore?: TokenStore;
  http?: HttpJsonClient;
  clock?: () => number;
  policyResolver?: AuthPolicyResolver;
  providerRegistry?: AuthProviderRegistry;
  /** Social OAuth client configs keyed by method. Requires `http`. */
  oauth?: {
    clients: Partial<Record<SocialOAuthMethod, OAuthClientConfig>>;
    challengeStore?: InMemoryPkceChallengeStore;
  };
  /** Magic-link wiring for the `email` method. */
  magicLink?: {
    delivery: MagicLinkDeliveryPort;
    magicLinkBaseUrl: string;
    tokenTtlMinutes?: number;
  };
  /** Admin SSO wiring. Requires `http` for OIDC completion. */
  sso?: {
    resolveClientConfig: SsoChallengeProviderOptions['resolveClientConfig'];
  };
  /**
   * Token refresh endpoint config.
   * Defaults to the first configured social OAuth client when omitted.
   */
  tokenRefresh?: {
    client: Pick<OAuthClientConfig, 'clientId' | 'tokenEndpoint'>;
    refreshSkewMs?: number;
  };
  /** Extra providers registered onto the AuthProviderRegistry. */
  extraProviders?: AuthProvider[];
}

/** Create an AuthClient with default in-memory stores and optional flow adapters. */
export function createAuthClient(options: CreateAuthClientOptions = {}): AuthClient {
  const policyResolver = options.policyResolver ?? new AuthPolicyResolver();
  const providerRegistry = options.providerRegistry ?? new AuthProviderRegistry();
  const tokenStore = options.tokenStore ?? new InMemoryTokenStore();
  const clock = options.clock;
  const http = options.http;

  const oauthProviders = new Map<AuthMethodId, OAuthPkceProvider>();
  const challengeStore = options.oauth?.challengeStore ?? new InMemoryPkceChallengeStore();

  if (options.oauth && http) {
    for (const method of ['google', 'apple', 'facebook'] as const) {
      const client = options.oauth.clients[method];
      if (!client) {
        continue;
      }
      const provider = new OAuthPkceProvider({
        method,
        surfaces: ['customer'],
        client,
        http,
        challengeStore,
        clock,
      });
      oauthProviders.set(method, provider);
      providerRegistry.register(provider);
    }
  }

  let magicLinkProvider: MagicLinkProvider | undefined;
  if (options.magicLink) {
    magicLinkProvider = new MagicLinkProvider({
      delivery: options.magicLink.delivery,
      magicLinkBaseUrl: options.magicLink.magicLinkBaseUrl,
      tokenTtlMinutes: options.magicLink.tokenTtlMinutes,
      clock,
    });
    providerRegistry.register(magicLinkProvider);
  }

  let ssoProvider: SsoChallengeProvider | undefined;
  let resolveSsoClientConfig:
    ((policy: ResolvedAuthPolicy) => OAuthClientConfig | Promise<OAuthClientConfig>) | undefined;

  if (options.sso && http) {
    ssoProvider = new SsoChallengeProvider({
      http,
      resolveClientConfig: options.sso.resolveClientConfig,
      clock,
    });
    providerRegistry.register(ssoProvider);
    resolveSsoClientConfig = async (policy) => {
      if (!policy.sso) {
        throw new Error('SSO policy missing on admin surface.');
      }
      return options.sso!.resolveClientConfig(policy.sso as ResolvedSsoPolicy);
    };
  }

  let tokenRefreshService: TokenRefreshService | undefined;
  const refreshClient = options.tokenRefresh?.client ?? firstOAuthClient(options.oauth?.clients);

  if (refreshClient && http) {
    tokenRefreshService = new TokenRefreshService({
      http,
      client: refreshClient,
      clock,
      refreshSkewMs: options.tokenRefresh?.refreshSkewMs,
    });
  }

  for (const provider of options.extraProviders ?? []) {
    providerRegistry.register(provider);
  }

  return new AuthClient({
    policyResolver,
    providerRegistry,
    tokenStore,
    oauthProviders,
    magicLinkProvider,
    ssoProvider,
    tokenRefreshService,
    resolveSsoClientConfig,
  });
}

function firstOAuthClient(
  clients: Partial<Record<SocialOAuthMethod, OAuthClientConfig>> | undefined,
): Pick<OAuthClientConfig, 'clientId' | 'tokenEndpoint'> | undefined {
  if (!clients) {
    return undefined;
  }
  for (const method of ['google', 'apple', 'facebook'] as const) {
    const client = clients[method];
    if (client) {
      return { clientId: client.clientId, tokenEndpoint: client.tokenEndpoint };
    }
  }
  return undefined;
}
