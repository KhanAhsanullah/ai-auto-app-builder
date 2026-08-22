import { describe, expect, it } from 'vitest';

import { AuthPolicyResolver } from '../src/domain/auth-policy-resolver.js';
import { SsoChallengeProvider } from '../src/domain/sso-challenge-provider.js';
import { AuthChallengeException } from '../src/errors.js';
import { ScriptedHttpJsonClient } from '../src/infrastructure/scripted-http-json-client.js';
import { createMinimalAuthConfig } from './helpers.js';

describe('SsoChallengeProvider', () => {
  function adminPolicyWithSso() {
    return new AuthPolicyResolver().resolve({
      authentication: createMinimalAuthConfig({
        admin: {
          methods: {
            email: true,
            sso: {
              enabled: true,
              provider: 'oidc',
              issuerUrl: 'https://idp.example.com',
            },
          },
          session: { tokenTtlMinutes: 480 },
          mfa: { required: true, methods: ['totp'] },
        },
      }),
      surface: 'admin',
      tenantId: 't1',
    });
  }

  it('starts an OIDC SSO challenge with PKCE', async () => {
    const http = new ScriptedHttpJsonClient();
    const provider = new SsoChallengeProvider({
      http,
      resolveClientConfig: () => ({
        clientId: 'admin-oidc',
        authorizationEndpoint: 'https://idp.example.com/authorize',
        tokenEndpoint: 'https://idp.example.com/token',
      }),
    });

    const started = await provider.start({
      policy: adminPolicyWithSso(),
      redirectUri: 'https://admin.example.com/sso/callback',
    });

    expect(started.authorizationUrl).toContain('code_challenge_method=S256');
    expect(started.authorizationUrl).toContain('client_id=admin-oidc');
  });

  it('completes OIDC SSO token exchange', async () => {
    const http = new ScriptedHttpJsonClient();
    const client = {
      clientId: 'admin-oidc',
      authorizationEndpoint: 'https://idp.example.com/authorize',
      tokenEndpoint: 'https://idp.example.com/token',
    };
    const provider = new SsoChallengeProvider({
      http,
      resolveClientConfig: () => client,
      clock: () => 5_000,
    });

    const started = await provider.start({
      policy: adminPolicyWithSso(),
      redirectUri: 'https://admin.example.com/sso/callback',
    });

    http.enqueue({
      status: 200,
      body: { access_token: 'sso-access', expires_in: 1800, id_token: 'id.jwt' },
    });

    const tokens = await provider.completeOidc({
      challengeId: started.challengeId,
      code: 'code-1',
      state: started.state!,
      client,
    });

    expect(tokens.accessToken).toBe('sso-access');
    expect(tokens.idToken).toBe('id.jwt');
    expect(tokens.expiresAt).toBe(5_000 + 1_800_000);
  });

  it('starts and completes a SAML SSO challenge', async () => {
    const provider = new SsoChallengeProvider({
      http: new ScriptedHttpJsonClient(),
      resolveClientConfig: () => ({
        clientId: 'saml-app',
        authorizationEndpoint: 'https://idp.example.com/sso/saml',
        tokenEndpoint: 'https://unused.example.com/token',
      }),
    });

    const policy = new AuthPolicyResolver().resolve({
      authentication: createMinimalAuthConfig({
        admin: {
          methods: {
            email: false,
            sso: {
              enabled: true,
              provider: 'saml',
              issuerUrl: 'https://idp.example.com',
            },
          },
          session: { tokenTtlMinutes: 480 },
          mfa: { required: false, methods: ['totp'] },
        },
      }),
      surface: 'admin',
    });

    const started = await provider.start({
      policy,
      redirectUri: 'https://admin.example.com/sso/acs',
    });

    expect(started.authorizationUrl).toContain('RelayState=');

    const tokens = await provider.completeSaml({
      challengeId: started.challengeId,
      state: started.state!,
      assertionId: 'assertion-1',
    });

    expect(tokens.accessToken).toContain('saml.assertion-1');
  });

  it('rejects SSO completion with wrong state', async () => {
    const provider = new SsoChallengeProvider({
      http: new ScriptedHttpJsonClient(),
      resolveClientConfig: () => ({
        clientId: 'saml-app',
        authorizationEndpoint: 'https://idp.example.com/sso/saml',
        tokenEndpoint: 'https://unused.example.com/token',
      }),
    });

    const policy = new AuthPolicyResolver().resolve({
      authentication: createMinimalAuthConfig({
        admin: {
          methods: {
            email: true,
            sso: {
              enabled: true,
              provider: 'saml',
              issuerUrl: 'https://idp.example.com',
            },
          },
          session: { tokenTtlMinutes: 480 },
          mfa: { required: true, methods: ['totp'] },
        },
      }),
      surface: 'admin',
    });

    const started = await provider.start({
      policy,
      redirectUri: 'https://admin.example.com/sso/acs',
    });

    await expect(
      provider.completeSaml({
        challengeId: started.challengeId,
        state: 'wrong',
        assertionId: 'a1',
      }),
    ).rejects.toThrow(AuthChallengeException);
  });
});
