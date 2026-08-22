import { describe, expect, it } from 'vitest';

import { OAuthPkceProvider } from '../src/domain/oauth-pkce-provider.js';
import { AuthChallengeException, AuthTokenException } from '../src/errors.js';
import { InMemoryPkceChallengeStore } from '../src/infrastructure/in-memory-pkce-challenge-store.js';
import { ScriptedHttpJsonClient } from '../src/infrastructure/scripted-http-json-client.js';
import { createMinimalAuthConfig } from './helpers.js';
import { AuthPolicyResolver } from '../src/domain/auth-policy-resolver.js';

describe('OAuthPkceProvider', () => {
  const fixedClock = () => 1_700_000_000_000;

  function createProvider(http = new ScriptedHttpJsonClient()) {
    const challengeStore = new InMemoryPkceChallengeStore();
    const provider = new OAuthPkceProvider({
      method: 'google',
      surfaces: ['customer'],
      client: {
        clientId: 'google-client',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        scopes: ['openid', 'email'],
      },
      http,
      challengeStore,
      clock: fixedClock,
    });
    return { provider, http, challengeStore };
  }

  it('starts a PKCE challenge with authorization URL', async () => {
    const { provider } = createProvider();
    const started = await provider.start({
      surface: 'customer',
      redirectUri: 'https://app.example.com/callback',
      tenantId: 't1',
    });

    expect(started.challengeId).toBeTruthy();
    expect(started.state).toBeTruthy();
    expect(started.authorizationUrl).toContain('code_challenge_method=S256');
    expect(started.authorizationUrl).toContain('client_id=google-client');
    expect(started.authorizationUrl).toContain('redirect_uri=');
  });

  it('completes code exchange and returns tokens', async () => {
    const { provider, http } = createProvider();
    const started = await provider.start({
      surface: 'customer',
      redirectUri: 'https://app.example.com/callback',
    });

    http.enqueue({
      status: 200,
      body: {
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 3600,
        token_type: 'Bearer',
      },
    });

    const tokens = await provider.complete({
      challengeId: started.challengeId,
      code: 'auth-code',
      state: started.state!,
    });

    expect(tokens.accessToken).toBe('access-1');
    expect(tokens.refreshToken).toBe('refresh-1');
    expect(tokens.expiresAt).toBe(fixedClock() + 3600_000);
  });

  it('rejects state mismatch', async () => {
    const { provider } = createProvider();
    const started = await provider.start({
      surface: 'customer',
      redirectUri: 'https://app.example.com/callback',
    });

    await expect(
      provider.complete({
        challengeId: started.challengeId,
        code: 'auth-code',
        state: 'wrong',
      }),
    ).rejects.toThrow(AuthChallengeException);
  });

  it('rejects failed token exchange', async () => {
    const { provider, http } = createProvider();
    const started = await provider.start({
      surface: 'customer',
      redirectUri: 'https://app.example.com/callback',
    });

    http.enqueue({ status: 400, body: { error: 'invalid_grant' } });

    await expect(
      provider.complete({
        challengeId: started.challengeId,
        code: 'bad',
        state: started.state!,
      }),
    ).rejects.toThrow(AuthTokenException);
  });

  it('supports policies that enable google', () => {
    const { provider } = createProvider();
    const policy = new AuthPolicyResolver().resolve({
      authentication: createMinimalAuthConfig({
        customer: {
          methods: {
            email: true,
            phone: false,
            guestCheckout: false,
            social: { google: true },
          },
          session: { tokenTtlMinutes: 60 },
        },
      }),
      surface: 'customer',
    });
    expect(provider.supports(policy)).toBe(true);
  });
});
