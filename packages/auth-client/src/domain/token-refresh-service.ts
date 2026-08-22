import { AuthTokenException } from '../errors.js';
import type { AuthTokenSet, OAuthClientConfig } from './auth-flow-types.js';
import type { HttpJsonClient } from './ports.js';
import type { ResolvedSessionPolicy } from '../types.js';
import type { TokenStore } from './auth-provider.js';

export interface TokenRefreshServiceOptions {
  http: HttpJsonClient;
  client: Pick<OAuthClientConfig, 'clientId' | 'tokenEndpoint'>;
  clock?: () => number;
  /** Refresh when fewer than this many ms remain (default 60s). */
  refreshSkewMs?: number;
}

const DEFAULT_TOKEN_STORE_KEY = 'session.tokens';

/**
 * Refresh OAuth access tokens when session policy allows and expiry is near.
 */
export class TokenRefreshService {
  private readonly clock: () => number;
  private readonly refreshSkewMs: number;

  constructor(private readonly options: TokenRefreshServiceOptions) {
    this.clock = options.clock ?? (() => Date.now());
    this.refreshSkewMs = options.refreshSkewMs ?? 60_000;
  }

  /** Return true when the token set should be refreshed. */
  needsRefresh(tokens: AuthTokenSet): boolean {
    return tokens.expiresAt - this.clock() <= this.refreshSkewMs;
  }

  /**
   * Ensure tokens are fresh according to session policy.
   * When refresh is disabled or unnecessary, returns the input tokens unchanged.
   */
  async ensureFresh(tokens: AuthTokenSet, session: ResolvedSessionPolicy): Promise<AuthTokenSet> {
    if (!this.needsRefresh(tokens)) {
      return tokens;
    }

    if (!session.refreshEnabled) {
      // Still usable until absolute expiry (admin sessions omit refresh by schema).
      if (tokens.expiresAt > this.clock()) {
        return tokens;
      }
      throw new AuthTokenException(
        'Access token expired and refresh is disabled by session policy.',
      );
    }

    if (!tokens.refreshToken) {
      throw new AuthTokenException('Access token expired and no refresh_token is available.');
    }

    const response = await this.options.http.postForm(this.options.client.tokenEndpoint, {
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      client_id: this.options.client.clientId,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new AuthTokenException(`Token refresh failed with status ${response.status}.`);
    }

    const accessToken = response.body.access_token;
    if (typeof accessToken !== 'string') {
      throw new AuthTokenException('Token refresh response missing access_token.');
    }

    const expiresIn =
      typeof response.body.expires_in === 'number' ? response.body.expires_in : 3600;

    const next: AuthTokenSet = {
      accessToken,
      expiresAt: this.clock() + expiresIn * 1000,
      refreshToken:
        typeof response.body.refresh_token === 'string'
          ? response.body.refresh_token
          : tokens.refreshToken,
    };

    if (typeof response.body.token_type === 'string') {
      next.tokenType = response.body.token_type;
    } else if (tokens.tokenType) {
      next.tokenType = tokens.tokenType;
    }

    if (typeof response.body.id_token === 'string') {
      next.idToken = response.body.id_token;
    } else if (tokens.idToken) {
      next.idToken = tokens.idToken;
    }

    return next;
  }

  /** Load tokens from a TokenStore, refresh if needed, and persist. */
  async ensureFreshInStore(
    store: TokenStore,
    session: ResolvedSessionPolicy,
    key = DEFAULT_TOKEN_STORE_KEY,
  ): Promise<AuthTokenSet | undefined> {
    const raw = await store.get(key);
    if (!raw) {
      return undefined;
    }

    let tokens: AuthTokenSet;
    try {
      tokens = JSON.parse(raw) as AuthTokenSet;
    } catch {
      throw new AuthTokenException('Stored auth tokens are not valid JSON.');
    }

    const fresh = await this.ensureFresh(tokens, session);
    if (fresh !== tokens) {
      await store.set(key, JSON.stringify(fresh));
    }
    return fresh;
  }

  async saveToStore(
    store: TokenStore,
    tokens: AuthTokenSet,
    key = DEFAULT_TOKEN_STORE_KEY,
  ): Promise<void> {
    await store.set(key, JSON.stringify(tokens));
  }
}
