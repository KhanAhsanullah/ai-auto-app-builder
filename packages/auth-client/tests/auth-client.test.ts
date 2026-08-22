import { ConfigProvider } from '@ai-commerce/config-runtime';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { createAuthClient } from '../src/infrastructure/create-auth-client.js';
import {
  AuthMethodNotEnabledException,
  AuthProviderNotConfiguredException,
} from '../src/errors.js';
import { ScriptedHttpJsonClient } from '../src/infrastructure/scripted-http-json-client.js';
import { sessionStorageKey } from '../src/domain/surface-auth-helpers.js';
import { createMinimalAuthConfig, FULL_TENANT_CONFIG_PATH, loadAuthExample } from './helpers.js';

describe('AuthClient facade', () => {
  it('resolves multi-surface policies and lists enabled methods', () => {
    const client = createAuthClient();
    const authentication = loadAuthExample();

    const policies = client.resolveAllPolicies(authentication, 'tenant-1');
    expect(policies.customer.tenantId).toBe('tenant-1');
    expect(policies.customer.enabledMethods).toContain('email');
    expect(policies.admin.enabledMethods).toContain('email');
    expect(policies.api.enabledMethods).toEqual([]);

    const methods = client.listEnabledMethods(authentication);
    expect(methods.some((entry) => entry.surface === 'customer' && entry.method === 'google')).toBe(
      true,
    );
  });

  it('runs magic-link start/complete and persists a customer session', async () => {
    const sent: string[] = [];
    const client = createAuthClient({
      magicLink: {
        delivery: {
          async send(input) {
            sent.push(input.email);
          },
        },
        magicLinkBaseUrl: 'https://app.example.com/auth/magic',
        tokenTtlMinutes: 20,
      },
      clock: () => 2_000,
    });

    const authentication = createMinimalAuthConfig();
    const started = await client.startMagicLink({
      authentication,
      email: 'buyer@example.com',
      surface: 'customer',
    });

    expect(sent).toEqual(['buyer@example.com']);

    const tokens = await client.completeMagicLink({
      challengeId: started.challengeId,
      confirmationToken: started.challengeId,
      surface: 'customer',
    });

    expect(tokens.accessToken.startsWith('magic.')).toBe(true);
    const session = await client.getSession('customer');
    expect(session?.accessToken).toBe(tokens.accessToken);
    expect(sessionStorageKey('customer')).toBe('session.customer.tokens');
  });

  it('runs OAuth PKCE start/complete through the facade', async () => {
    const http = new ScriptedHttpJsonClient();
    const client = createAuthClient({
      http,
      oauth: {
        clients: {
          google: {
            clientId: 'google-client',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
            scopes: ['openid', 'email'],
          },
        },
      },
      clock: () => 10_000,
    });

    const authentication = createMinimalAuthConfig({
      customer: {
        methods: {
          email: true,
          phone: false,
          guestCheckout: false,
          social: { google: true },
        },
        session: { tokenTtlMinutes: 60, refreshEnabled: true },
      },
    });

    const started = await client.startOAuth({
      authentication,
      method: 'google',
      surface: 'customer',
      redirectUri: 'https://app.example.com/callback',
    });

    expect(started.authorizationUrl).toContain('code_challenge_method=S256');

    http.enqueue({
      status: 200,
      body: {
        access_token: 'oauth-access',
        refresh_token: 'oauth-refresh',
        expires_in: 3600,
      },
    });

    const tokens = await client.completeOAuth({
      method: 'google',
      challengeId: started.challengeId,
      code: 'code-1',
      state: started.state!,
      surface: 'customer',
    });

    expect(tokens.accessToken).toBe('oauth-access');
    await expect(client.getSession('customer')).resolves.toMatchObject({
      accessToken: 'oauth-access',
    });
  });

  it('refuses OAuth when method is disabled by policy', async () => {
    const client = createAuthClient({
      http: new ScriptedHttpJsonClient(),
      oauth: {
        clients: {
          google: {
            clientId: 'google-client',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          },
        },
      },
    });

    await expect(
      client.startOAuth({
        authentication: createMinimalAuthConfig(),
        method: 'google',
        surface: 'customer',
        redirectUri: 'https://app.example.com/callback',
      }),
    ).rejects.toThrow(AuthMethodNotEnabledException);
  });

  it('throws when magic link is not configured', async () => {
    const client = createAuthClient();
    await expect(
      client.startMagicLink({
        authentication: createMinimalAuthConfig(),
        email: 'a@b.com',
        surface: 'customer',
      }),
    ).rejects.toThrow(AuthProviderNotConfiguredException);
  });

  it('runs SSO OIDC through the facade and refreshes customer OAuth sessions', async () => {
    const http = new ScriptedHttpJsonClient();
    const oidcClient = {
      clientId: 'admin-oidc',
      authorizationEndpoint: 'https://idp.example.com/authorize',
      tokenEndpoint: 'https://idp.example.com/token',
    };

    const client = createAuthClient({
      http,
      oauth: {
        clients: {
          google: {
            clientId: 'google-client',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          },
        },
      },
      sso: {
        resolveClientConfig: () => oidcClient,
      },
      clock: () => 100_000,
    });

    const authentication = createMinimalAuthConfig({
      customer: {
        methods: {
          email: true,
          phone: false,
          guestCheckout: false,
          social: { google: true },
        },
        session: { tokenTtlMinutes: 60, refreshEnabled: true },
      },
      admin: {
        methods: {
          email: true,
          sso: {
            enabled: true,
            provider: 'oidc',
            issuerUrl: 'https://idp.example.com',
          },
        },
        session: { tokenTtlMinutes: 480, idleTimeoutMinutes: 30 },
        mfa: { required: true, methods: ['totp'] },
      },
    });

    const started = await client.startSso({
      authentication,
      redirectUri: 'https://admin.example.com/callback',
    });

    http.enqueue({
      status: 200,
      body: { access_token: 'sso-access', expires_in: 1800 },
    });

    await client.completeSsoOidc({
      authentication,
      challengeId: started.challengeId,
      code: 'c1',
      state: started.state!,
    });

    await expect(client.getSession('admin')).resolves.toMatchObject({
      accessToken: 'sso-access',
    });

    await client.saveSession('customer', {
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: 100_000 + 10_000,
    });

    http.enqueue({
      status: 200,
      body: { access_token: 'customer-refreshed', expires_in: 3600 },
    });

    const fresh = await client.ensureFreshSession({
      authentication,
      surface: 'customer',
    });

    expect(fresh?.accessToken).toBe('customer-refreshed');
  });

  it('maps ConfigProvider output through the facade', () => {
    const tenantConfig = JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8'));
    const result = new ConfigProvider({ cache: false }).resolve({
      tenantConfig,
      skipCache: true,
    });

    const client = createAuthClient();
    const policy = client.resolvePolicyFromConfigProvider(result, 'customer');
    expect(policy.surface).toBe('customer');
    expect(policy.tenantId).toBe(result.config.tenant.id);
  });

  it('clears surface sessions', async () => {
    const client = createAuthClient({
      magicLink: {
        delivery: {
          async send() {
            return;
          },
        },
        magicLinkBaseUrl: 'https://app.example.com/auth/magic',
      },
    });

    const authentication = createMinimalAuthConfig();
    const started = await client.startMagicLink({
      authentication,
      email: 'clear@example.com',
      surface: 'customer',
    });

    await client.completeMagicLink({
      challengeId: started.challengeId,
      confirmationToken: started.challengeId,
      surface: 'customer',
    });

    await client.clearSession('customer');
    await expect(client.getSession('customer')).resolves.toBeUndefined();
  });
});
