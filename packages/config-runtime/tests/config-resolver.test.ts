import { describe, expect, it } from 'vitest';

import { ConfigResolver } from '../src/config-resolver.js';
import { PLATFORM_DEFAULTS } from '../src/defaults/platform-defaults.js';
import { ConfigResolutionException } from '../src/errors.js';
import { FULL_EXAMPLE_PATH } from './helpers.js';
import { ConfigLoader } from '../src/config-loader.js';

describe('ConfigResolver', () => {
  const resolver = new ConfigResolver();
  const loader = new ConfigLoader();

  it('merges platform, vertical, and tenant layers in priority order', async () => {
    const tenantConfig = await loader.loadFromFile(FULL_EXAMPLE_PATH);
    const resolved = resolver.resolve({ tenantConfig });

    expect(resolved.vertical).toBe('grocery');
    expect(resolved.config.payments?.defaultGateway).toBe('jazzcash');
    expect(resolved.config.featureFlags?.flags?.['grocery.substitutions']).toBe(true);
    expect(resolved.config.authentication?.customer.methods.email).toBe(true);
  });

  it('applies platform defaults for missing tenant values', async () => {
    const tenantConfig = await loader.loadFromFile(FULL_EXAMPLE_PATH);
    const resolved = resolver.resolve({ tenantConfig });

    expect(resolved.config.meta.schemaVersion).toBe(PLATFORM_DEFAULTS.meta?.schemaVersion);
  });

  it('applies environment overrides for the active environment', async () => {
    const tenantConfig = await loader.loadFromFile<Record<string, unknown>>(FULL_EXAMPLE_PATH);
    const environment = tenantConfig.environment as Record<string, unknown>;
    const withOverrides = {
      ...tenantConfig,
      environment: {
        ...environment,
        current: 'development' as const,
        overrides: {
          development: {
            payments: {
              defaultGateway: 'paypal',
            },
          },
        },
      },
    };

    const resolved = resolver.resolve({
      tenantConfig: withOverrides,
      environment: 'development',
    });

    expect(resolved.config.payments?.defaultGateway).toBe('paypal');
    expect(resolved.environment).toBe('development');
  });

  it('throws when tenant.vertical is missing', () => {
    expect(() =>
      resolver.resolve({
        tenantConfig: {
          tenant: {
            id: '00000000-0000-4000-8000-000000000001',
            slug: 'demo',
            name: 'Demo',
            status: 'active',
            defaultLocale: 'en',
            defaultTimezone: 'UTC',
          },
        },
      }),
    ).toThrow(ConfigResolutionException);
  });

  it('returns immutable frozen configuration', async () => {
    const tenantConfig = await loader.loadFromFile(FULL_EXAMPLE_PATH);
    const resolved = resolver.resolve({ tenantConfig });

    expect(Object.isFrozen(resolved.config)).toBe(true);
    expect(Object.isFrozen(resolved.config.tenant)).toBe(true);
  });
});
