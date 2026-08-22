import { AuthChallengeException, AuthPolicyResolutionException } from '../errors.js';
import type {
  AuthChallengeStartResult,
  AuthTokenSet,
  OAuthClientConfig,
  SsoChallengeRecord,
} from './auth-flow-types.js';
import type { HttpJsonClient } from './ports.js';
import {
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from './pkce.js';
import type { ResolvedAuthPolicy, ResolvedSsoPolicy } from '../types.js';
import type { AuthProvider } from './auth-provider.js';

export interface SsoChallengeProviderOptions {
  http: HttpJsonClient;
  /**
   * Resolve OIDC endpoints from issuer metadata.
   * For SAML, return an ACS-oriented authorization endpoint without PKCE.
   */
  resolveClientConfig: (sso: ResolvedSsoPolicy) => OAuthClientConfig | Promise<OAuthClientConfig>;
  clock?: () => number;
  challengeTtlMs?: number;
}

/** In-memory SSO challenge store. */
export class InMemorySsoChallengeStore {
  private readonly byId = new Map<string, SsoChallengeRecord>();

  async save(record: SsoChallengeRecord): Promise<void> {
    this.byId.set(record.challengeId, record);
  }

  async findById(challengeId: string): Promise<SsoChallengeRecord | undefined> {
    return this.byId.get(challengeId);
  }

  async delete(challengeId: string): Promise<void> {
    this.byId.delete(challengeId);
  }
}

/**
 * Admin SSO challenge adapter (SAML / OIDC).
 * OIDC uses authorization-code + PKCE; SAML returns an IdP redirect URL without code exchange.
 */
export class SsoChallengeProvider implements AuthProvider {
  readonly id = 'sso' as const;
  readonly surfaces = ['admin'] as const;
  private readonly clock: () => number;
  private readonly challengeTtlMs: number;
  private readonly store = new InMemorySsoChallengeStore();

  constructor(private readonly options: SsoChallengeProviderOptions) {
    this.clock = options.clock ?? (() => Date.now());
    this.challengeTtlMs = options.challengeTtlMs ?? 10 * 60 * 1000;
  }

  supports(policy: ResolvedAuthPolicy): boolean {
    return policy.surface === 'admin' && policy.enabledMethods.includes('sso') && !!policy.sso;
  }

  /** Start an SSO challenge using the resolved admin SSO policy. */
  async start(input: {
    policy: ResolvedAuthPolicy;
    redirectUri: string;
    tenantId?: string;
  }): Promise<AuthChallengeStartResult> {
    if (!input.policy.sso) {
      throw new AuthPolicyResolutionException('Admin SSO policy is not enabled.');
    }

    const sso = input.policy.sso;
    const client = await this.options.resolveClientConfig(sso);
    const challengeId = generateOAuthState(24);
    const state = generateOAuthState();

    if (sso.provider === 'oidc') {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);

      await this.store.save({
        challengeId,
        surface: 'admin',
        tenantId: input.tenantId ?? input.policy.tenantId,
        provider: 'oidc',
        issuerUrl: sso.issuerUrl,
        redirectUri: input.redirectUri,
        state,
        codeVerifier,
        createdAt: this.clock(),
      });

      const authorizationUrl = buildAuthorizationUrl(client.authorizationEndpoint, {
        response_type: 'code',
        client_id: client.clientId,
        redirect_uri: input.redirectUri,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: (client.scopes ?? ['openid', 'profile', 'email']).join(' '),
        ...client.extraAuthParams,
      });

      return { challengeId, authorizationUrl, state };
    }

    await this.store.save({
      challengeId,
      surface: 'admin',
      tenantId: input.tenantId ?? input.policy.tenantId,
      provider: 'saml',
      issuerUrl: sso.issuerUrl,
      redirectUri: input.redirectUri,
      state,
      createdAt: this.clock(),
    });

    const authorizationUrl = buildAuthorizationUrl(client.authorizationEndpoint, {
      SAMLRequest: 'pending',
      RelayState: state,
      ...client.extraAuthParams,
    });

    return { challengeId, authorizationUrl, state };
  }

  /** Complete an OIDC SSO code exchange. */
  async completeOidc(input: {
    challengeId: string;
    code: string;
    state: string;
    client: OAuthClientConfig;
  }): Promise<AuthTokenSet> {
    const record = await this.requireChallenge(input.challengeId);
    if (record.provider !== 'oidc' || !record.codeVerifier) {
      throw new AuthChallengeException('SSO challenge is not an OIDC PKCE challenge.');
    }
    if (record.state !== input.state) {
      throw new AuthChallengeException('SSO state mismatch.');
    }

    const response = await this.options.http.postForm(input.client.tokenEndpoint, {
      grant_type: 'authorization_code',
      code: input.code,
      redirect_uri: record.redirectUri,
      client_id: input.client.clientId,
      code_verifier: record.codeVerifier,
    });

    await this.store.delete(input.challengeId);

    if (response.status < 200 || response.status >= 300) {
      throw new AuthChallengeException(`SSO token exchange failed with status ${response.status}.`);
    }

    const accessToken = response.body.access_token;
    if (typeof accessToken !== 'string') {
      throw new AuthChallengeException('SSO token response missing access_token.');
    }

    const expiresIn =
      typeof response.body.expires_in === 'number' ? response.body.expires_in : 3600;

    const tokens: AuthTokenSet = {
      accessToken,
      expiresAt: this.clock() + expiresIn * 1000,
    };
    if (typeof response.body.refresh_token === 'string') {
      tokens.refreshToken = response.body.refresh_token;
    }
    if (typeof response.body.id_token === 'string') {
      tokens.idToken = response.body.id_token;
    }
    return tokens;
  }

  /** Complete a SAML SSO assertion handoff (assertion validated by caller/platform). */
  async completeSaml(input: {
    challengeId: string;
    state: string;
    assertionId: string;
  }): Promise<AuthTokenSet> {
    const record = await this.requireChallenge(input.challengeId);
    if (record.provider !== 'saml') {
      throw new AuthChallengeException('SSO challenge is not a SAML challenge.');
    }
    if (record.state !== input.state) {
      throw new AuthChallengeException('SSO state mismatch.');
    }
    if (!input.assertionId) {
      throw new AuthChallengeException('SAML assertion id is required.');
    }

    await this.store.delete(input.challengeId);

    return {
      accessToken: `saml.${input.assertionId}.${generateOAuthState(12)}`,
      expiresAt: this.clock() + 8 * 60 * 60 * 1000,
      tokenType: 'Bearer',
    };
  }

  getChallengeStore(): InMemorySsoChallengeStore {
    return this.store;
  }

  private async requireChallenge(challengeId: string): Promise<SsoChallengeRecord> {
    const record = await this.store.findById(challengeId);
    if (!record) {
      throw new AuthChallengeException(`Unknown SSO challenge '${challengeId}'.`);
    }
    if (this.clock() - record.createdAt > this.challengeTtlMs) {
      await this.store.delete(challengeId);
      throw new AuthChallengeException(`SSO challenge '${challengeId}' has expired.`);
    }
    return record;
  }
}
