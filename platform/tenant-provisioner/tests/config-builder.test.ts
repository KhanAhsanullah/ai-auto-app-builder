import { PLATFORM_DEFAULTS, VERTICAL_DEFAULTS } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import { ConfigBuilder } from '../src/domain/config-builder.js';
import { IdentityValidator } from '../src/domain/identity-validator.js';
import { VALID_PROVISIONING_REQUEST, VALID_PROVISIONING_REQUEST_WITH_ID } from './helpers.js';

describe('ConfigBuilder', () => {
  const validator = new IdentityValidator();
  const builder = new ConfigBuilder();

  it('builds tenant identity into the configuration document', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST_WITH_ID);
    const document = builder.build(identity);

    expect(document.tenant).toEqual({
      id: identity.id,
      slug: identity.slug,
      name: identity.name,
      vertical: identity.vertical,
      status: 'draft',
      defaultLocale: identity.defaultLocale,
      defaultTimezone: identity.defaultTimezone,
      defaultCountry: identity.defaultCountry,
      subscriptionTier: identity.subscriptionTier,
    });
  });

  it('sets tenant.status to draft', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST);
    const document = builder.build(identity);

    expect(document.tenant?.status).toBe('draft');
  });

  it('creates required meta fields', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST);
    const document = builder.build(identity);

    expect(document.meta?.schemaVersion).toBe('v1');
    expect(document.meta?.configVersion).toBe(1);
    expect(document.meta?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(document.meta?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(document.meta?.migrationHistory).toEqual([]);
  });

  it('includes required tenant-layer sections', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST);
    const document = builder.build(identity);

    expect(document.company).toBeDefined();
    expect(document.branding).toBeDefined();
    expect(document.theme).toBeDefined();
    expect(document.navigation).toBeDefined();
    expect(document.languages).toBeDefined();
    expect(document.currency).toBeDefined();
  });

  it('merges configOverrides into the tenant document', () => {
    const identity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      configOverrides: {
        branding: {
          appName: 'Custom App',
          tagline: 'Custom tagline',
        },
        company: {
          contactEmail: 'hello@custom.test',
        },
      },
    });

    const document = builder.build(identity);

    expect(document.branding?.appName).toBe('Custom App');
    expect(document.branding?.tagline).toBe('Custom tagline');
    expect(document.company?.contactEmail).toBe('hello@custom.test');
    expect(document.company?.legalName).toBe(identity.name);
  });

  it('preserves canonical identity fields when configOverrides include tenant', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST_WITH_ID);
    const document = builder.build({
      ...identity,
      configOverrides: {
        tenant: {
          slug: 'override-slug',
          name: 'Override Name',
          status: 'active',
        },
      },
    });

    expect(document.tenant?.id).toBe(identity.id);
    expect(document.tenant?.slug).toBe(identity.slug);
    expect(document.tenant?.name).toBe(identity.name);
    expect(document.tenant?.status).toBe('draft');
  });

  it('does not copy platform defaults into the stored document', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST);
    const document = builder.build(identity);

    const platformOnlyKeys = [
      'featureFlags',
      'authentication',
      'payments',
      'integrations',
      'aiSettings',
      'plugins',
      'notifications',
    ] as const;

    for (const key of platformOnlyKeys) {
      expect(document[key as keyof typeof document]).toBeUndefined();
    }
  });

  it('does not copy vertical defaults into the stored document', () => {
    const identity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      vertical: 'grocery',
    });
    const document = builder.build(identity);

    const groceryDefaults = VERTICAL_DEFAULTS.grocery;

    for (const key of Object.keys(groceryDefaults)) {
      expect(document[key as keyof typeof document]).toBeUndefined();
    }
  });

  it('initializes environment configuration derived from tenant slug', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST);
    const document = builder.build(identity);

    expect(document.environment).toEqual({
      current: 'development',
      targets: {
        development: {
          apiBaseUrl: 'http://localhost:3000',
          debug: true,
          logLevel: 'debug',
        },
        staging: {
          apiBaseUrl: `https://api-staging.${identity.slug}.platform.local`,
          debug: false,
          logLevel: 'info',
        },
        production: {
          apiBaseUrl: `https://api.${identity.slug}.platform.local`,
          debug: false,
          logLevel: 'warn',
        },
      },
      promotionPolicy: {
        requireApproval: true,
        runValidationOnPromote: true,
      },
    });
    expect(document.environment?.overrides).toBeUndefined();
  });

  it('uses defaultLocale for languages defaults', () => {
    const identity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      defaultLocale: 'en-GB',
    });
    const document = builder.build(identity);

    expect(document.languages).toEqual({
      default: 'en-GB',
      supported: ['en-GB'],
      fallback: 'en-GB',
    });
  });

  it('applies vertical seed values to the stored document', () => {
    const identity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      vertical: 'grocery',
    });
    const document = builder.build(identity);

    expect(document.branding?.tagline).toBe('Fresh essentials, delivered');
    expect(document.theme?.colors?.primary).toBe('#16A34A');
  });

  it('produces different stored config for ecommerce and grocery verticals', () => {
    const ecommerceIdentity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      slug: 'ecom-shop',
      vertical: 'ecommerce',
    });
    const groceryIdentity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      slug: 'grocery-shop',
      vertical: 'grocery',
    });

    const ecommerceDocument = builder.build(ecommerceIdentity);
    const groceryDocument = builder.build(groceryIdentity);

    expect(ecommerceDocument.branding?.tagline).not.toBe(groceryDocument.branding?.tagline);
    expect(ecommerceDocument.theme?.colors?.primary).not.toBe(
      groceryDocument.theme?.colors?.primary,
    );
    expect(ecommerceDocument.navigation?.web?.primary).not.toEqual(
      groceryDocument.navigation?.web?.primary,
    );
  });

  it('lets configOverrides override vertical seed values', () => {
    const identity = validator.validate({
      ...VALID_PROVISIONING_REQUEST,
      vertical: 'grocery',
      configOverrides: {
        branding: {
          tagline: 'Override tagline from request',
        },
      },
    });

    const document = builder.build(identity);

    expect(document.branding?.tagline).toBe('Override tagline from request');
  });

  it('stores tenant-specific environment URLs instead of platform placeholder URLs', () => {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST);
    const document = builder.build(identity);

    expect(document.environment?.targets?.staging?.apiBaseUrl).toBe(
      `https://api-staging.${identity.slug}.platform.local`,
    );
    expect(document.environment?.targets?.staging?.apiBaseUrl).not.toBe(
      PLATFORM_DEFAULTS.environment?.targets?.staging?.apiBaseUrl,
    );
  });
});
