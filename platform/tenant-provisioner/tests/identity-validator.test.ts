import { describe, expect, it } from 'vitest';

import { IdentityValidator } from '../src/domain/identity-validator.js';
import { TenantIdentityValidationException } from '../src/errors.js';
import { VALID_PROVISIONING_REQUEST, VALID_PROVISIONING_REQUEST_WITH_ID } from './helpers.js';

describe('IdentityValidator', () => {
  const validator = new IdentityValidator();

  it('validates a complete provisioning request', () => {
    const result = validator.validate(VALID_PROVISIONING_REQUEST_WITH_ID);

    expect(result.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(result.slug).toBe('beta-shop');
    expect(result.name).toBe('Beta Shop');
    expect(result.vertical).toBe('grocery');
    expect(result.defaultLocale).toBe('en-US');
    expect(result.defaultTimezone).toBe('America/New_York');
    expect(result.defaultCountry).toBe('US');
    expect(result.subscriptionTier).toBe('starter');
  });

  it('generates a UUID when id is omitted', () => {
    const first = validator.validate(VALID_PROVISIONING_REQUEST);
    const second = validator.validate(VALID_PROVISIONING_REQUEST);

    expect(first.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(second.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(first.id).not.toBe(second.id);
  });

  it('rejects an invalid UUID', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        id: 'not-a-uuid',
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('rejects an invalid slug', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        slug: 'Invalid_Slug',
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('rejects an invalid vertical', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        vertical: 'retail' as never,
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('rejects an invalid locale', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        defaultLocale: 'english',
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('rejects an invalid timezone', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        defaultTimezone: '',
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('rejects an invalid defaultCountry', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        defaultCountry: 'USA',
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('rejects an invalid subscriptionTier', () => {
    expect(() =>
      validator.validate({
        ...VALID_PROVISIONING_REQUEST,
        subscriptionTier: 'enterprise-plus' as never,
      }),
    ).toThrow(TenantIdentityValidationException);
  });

  it('preserves configOverrides on the validated identity', () => {
    const result = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      configOverrides: {
        branding: {
          tagline: 'Custom tagline',
        },
      },
    });

    expect(result.configOverrides).toEqual({
      branding: {
        tagline: 'Custom tagline',
      },
    });
  });
});
