import { AuthChallengeException, AuthTokenException } from '../errors.js';
import type {
  AuthChallengeStartResult,
  AuthTokenSet,
  OAuthClientConfig,
  PkceChallengeRecord,
} from '../domain/auth-flow-types.js';
import type { HttpJsonClient } from '../domain/ports.js';
import {
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from '../domain/pkce.js';
import type { AuthMethodId, AuthSurface, ResolvedAuthPolicy } from '../types.js';
import type { AuthProvider } from './auth-provider.js';
import type { InMemoryPkceChallengeStore } from '../infrastructure/in-memory-pkce-challenge-store.js';

export interface OAuthPkceProviderOptions {
  method: AuthMethodId;
  surfaces: readonly AuthSurface[];
  client: OAuthClientConfig;
  http: HttpJsonClient;
  challengeStore: InMemoryPkceChallengeStore;
  clock?: () => number;
  /** Challenge TTL in milliseconds (default 10 minutes). */
  challengeTtlMs?: number;
}

/**
 * OAuth 2.0 Authorization Code + PKCE provider for social/OIDC methods.
 * Uses an injectable HTTP client — no hardcoded live IdP calls.
 */
export class OAuthPkceProvider implements AuthProvider {
  readonly id: AuthMethodId;
  readonly surfaces: readonly AuthSurface[];
  private readonly clock: () => number;
  private readonly challengeTtlMs: number;

  constructor(private readonly options: OAuthPkceProviderOptions) {
    this.id = options.method;
    this.surfaces = options.surfaces;
    this.clock = options.clock ?? (() => Date.now());
    this.challengeTtlMs = options.challengeTtlMs ?? 10 * 60 * 1000;
  }

  supports(policy: ResolvedAuthPolicy): boolean {
    return this.surfaces.includes(policy.surface) && policy.enabledMethods.includes(this.id);
  }

  /** Start an authorization-code + PKCE challenge. */
  async start(input: {
    tenantId?: string;
    surface: AuthSurface;
    redirectUri: string;
  }): Promise<AuthChallengeStartResult> {
    if (!this.surfaces.includes(input.surface)) {
      throw new AuthChallengeException(
        `OAuth method '${this.id}' does not support surface '${input.surface}'.`,
      );
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateOAuthState();
    const challengeId = generateOAuthState(24);

    const record: PkceChallengeRecord = {
      challengeId,
      method: this.id,
      surface: input.surface,
      tenantId: input.tenantId,
      redirectUri: input.redirectUri,
      codeVerifier,
      state,
      createdAt: this.clock(),
    };

    await this.options.challengeStore.save(record);

    const params: Record<string, string> = {
      response_type: 'code',
      client_id: this.options.client.clientId,
      redirect_uri: input.redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      ...(this.options.client.scopes?.length
        ? { scope: this.options.client.scopes.join(' ') }
        : {}),
      ...this.options.client.extraAuthParams,
    };

    return {
      challengeId,
      authorizationUrl: buildAuthorizationUrl(this.options.client.authorizationEndpoint, params),
      state,
    };
  }

  /** Exchange an authorization code for tokens and consume the challenge. */
  async complete(input: {
    challengeId: string;
    code: string;
    state: string;
  }): Promise<AuthTokenSet> {
    const record = await this.options.challengeStore.findById(input.challengeId);
    if (!record) {
      throw new AuthChallengeException(`Unknown OAuth challenge '${input.challengeId}'.`);
    }

    if (this.clock() - record.createdAt > this.challengeTtlMs) {
      await this.options.challengeStore.delete(input.challengeId);
      throw new AuthChallengeException(`OAuth challenge '${input.challengeId}' has expired.`);
    }

    if (record.state !== input.state) {
      throw new AuthChallengeException('OAuth state mismatch.');
    }

    const response = await this.options.http.postForm(this.options.client.tokenEndpoint, {
      grant_type: 'authorization_code',
      code: input.code,
      redirect_uri: record.redirectUri,
      client_id: this.options.client.clientId,
      code_verifier: record.codeVerifier,
    });

    await this.options.challengeStore.delete(input.challengeId);

    if (response.status < 200 || response.status >= 300) {
      throw new AuthTokenException(`OAuth token exchange failed with status ${response.status}.`);
    }

    return this.parseTokenResponse(response.body);
  }

  private parseTokenResponse(body: Record<string, unknown>): AuthTokenSet {
    const accessToken = body.access_token;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new AuthTokenException('OAuth token response missing access_token.');
    }

    const expiresIn =
      typeof body.expires_in === 'number'
        ? body.expires_in
        : typeof body.expires_in === 'string'
          ? Number(body.expires_in)
          : 3600;

    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new AuthTokenException('OAuth token response has invalid expires_in.');
    }

    const tokens: AuthTokenSet = {
      accessToken,
      expiresAt: this.clock() + expiresIn * 1000,
    };

    if (typeof body.refresh_token === 'string') {
      tokens.refreshToken = body.refresh_token;
    }
    if (typeof body.token_type === 'string') {
      tokens.tokenType = body.token_type;
    }
    if (typeof body.id_token === 'string') {
      tokens.idToken = body.id_token;
    }

    return tokens;
  }
}
