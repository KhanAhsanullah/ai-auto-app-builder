import { describe, expect, it } from 'vitest';

import { AuthPolicyValidator } from '../src/domain/auth-policy-validator.js';
import { AuthPolicyValidationException } from '../src/errors.js';
import { createMinimalAuthConfig, loadAuthExample } from './helpers.js';

describe('AuthPolicyValidator', () => {
  const validator = new AuthPolicyValidator();

  it('accepts the canonical authentication example', () => {
    expect(() => validator.validate(loadAuthExample())).not.toThrow();
  });

  it('accepts a minimal valid config', () => {
    expect(() => validator.validate(createMinimalAuthConfig())).not.toThrow();
  });

  it('rejects customer config with no identity methods and no guest checkout', () => {
    const config = createMinimalAuthConfig({
      customer: {
        methods: {
          email: false,
          phone: false,
          guestCheckout: false,
        },
        session: { tokenTtlMinutes: 60 },
      },
    });

    expect(() => validator.validate(config)).toThrow(AuthPolicyValidationException);
  });

  it('rejects customer MFA required without methods', () => {
    const config = createMinimalAuthConfig({
      customer: {
        methods: { email: true, phone: false, guestCheckout: false },
        session: { tokenTtlMinutes: 60 },
        mfa: { required: true, methods: [] },
      },
    });

    expect(() => validator.validate(config)).toThrow(/Customer MFA is required/);
  });

  it('rejects admin SSO enabled without provider and issuerUrl', () => {
    const config = createMinimalAuthConfig({
      admin: {
        methods: {
          email: true,
          sso: { enabled: true },
        },
        session: { tokenTtlMinutes: 480 },
        mfa: { required: true, methods: ['totp'] },
      },
    });

    expect(() => validator.validate(config)).toThrow(/SSO is enabled but provider/);
  });

  it('rejects admin with neither email nor SSO', () => {
    const config = createMinimalAuthConfig({
      admin: {
        methods: {
          email: false,
          sso: { enabled: false },
        },
        session: { tokenTtlMinutes: 480 },
        mfa: { required: false, methods: ['totp'] },
      },
    });

    expect(() => validator.validate(config)).toThrow(/email and\/or enabled SSO/);
  });

  it('accepts admin SSO when fully configured', () => {
    const config = createMinimalAuthConfig({
      admin: {
        methods: {
          email: false,
          sso: {
            enabled: true,
            provider: 'oidc',
            issuerUrl: 'https://idp.example.com',
          },
        },
        session: { tokenTtlMinutes: 480 },
        mfa: { required: true, methods: ['totp'] },
      },
    });

    expect(() => validator.validate(config)).not.toThrow();
  });
});
