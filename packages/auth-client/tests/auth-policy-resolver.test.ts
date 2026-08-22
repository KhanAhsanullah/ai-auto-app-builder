import { describe, expect, it } from 'vitest';

import { AuthPolicyResolver } from '../src/domain/auth-policy-resolver.js';
import { createMinimalAuthConfig, loadAuthExample } from './helpers.js';

describe('AuthPolicyResolver', () => {
  const resolver = new AuthPolicyResolver();

  it('resolves customer policy with enabled methods and session', () => {
    const policy = resolver.resolve({
      authentication: loadAuthExample(),
      surface: 'customer',
      tenantId: 'tenant-1',
    });

    expect(policy.surface).toBe('customer');
    expect(policy.tenantId).toBe('tenant-1');
    expect(policy.enabledMethods).toEqual(
      expect.arrayContaining(['email', 'phone', 'guest', 'google']),
    );
    expect(policy.enabledMethods).not.toContain('apple');
    expect(policy.session.tokenTtlMinutes).toBe(10080);
    expect(policy.session.refreshEnabled).toBe(true);
    expect(policy.session.maxDevices).toBe(5);
    expect(policy.mfa?.required).toBe(false);
    expect(policy.mfa?.methods).toEqual(['sms']);
  });

  it('resolves admin policy with MFA and optional SSO', () => {
    const policy = resolver.resolve({
      authentication: loadAuthExample(),
      surface: 'admin',
    });

    expect(policy.enabledMethods).toEqual(['email']);
    expect(policy.session.tokenTtlMinutes).toBe(480);
    expect(policy.session.idleTimeoutMinutes).toBe(30);
    expect(policy.mfa).toBeDefined();
    expect(policy.mfa?.required).toBe(true);
    expect(policy.mfa?.methods).toEqual(['totp']);
    expect(policy.sso).toBeUndefined();
    expect(policy.defaultRoles).toEqual(['owner', 'admin', 'manager', 'staff']);
  });

  it('resolves admin SSO when enabled with provider details', () => {
    const authentication = createMinimalAuthConfig({
      admin: {
        methods: {
          email: true,
          sso: {
            enabled: true,
            provider: 'saml',
            issuerUrl: 'https://sso.example.com',
          },
        },
        session: { tokenTtlMinutes: 240, idleTimeoutMinutes: 15 },
        mfa: { required: true, methods: ['totp', 'email'] },
      },
    });

    const policy = resolver.resolve({ authentication, surface: 'admin' });

    expect(policy.enabledMethods).toEqual(['email', 'sso']);
    expect(policy.sso).toEqual({
      enabled: true,
      provider: 'saml',
      issuerUrl: 'https://sso.example.com',
    });
  });

  it('resolves api policy as disabled when api section is absent', () => {
    const policy = resolver.resolve({
      authentication: createMinimalAuthConfig(),
      surface: 'api',
    });

    expect(policy.enabledMethods).toEqual([]);
    expect(policy.api?.enabled).toBe(false);
  });

  it('resolves api policy with api_key and client_credentials', () => {
    const policy = resolver.resolve({
      authentication: createMinimalAuthConfig({
        api: {
          enabled: true,
          keyRotationDays: 60,
          oauthClientCredentials: true,
        },
      }),
      surface: 'api',
    });

    expect(policy.enabledMethods).toEqual(['api_key', 'client_credentials']);
    expect(policy.api).toEqual({
      enabled: true,
      keyRotationDays: 60,
      oauthClientCredentials: true,
    });
  });

  it('reports method enablement via isMethodEnabled', () => {
    const policy = resolver.resolve({
      authentication: loadAuthExample(),
      surface: 'customer',
    });

    expect(resolver.isMethodEnabled(policy, 'email')).toBe(true);
    expect(resolver.isMethodEnabled(policy, 'facebook')).toBe(false);
  });
});
