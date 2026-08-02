import { describe, expect, it } from 'vitest';

import { ConfigProvider } from '../src/config-provider.js';
import { ConfigValidationException } from '../src/errors.js';
import { FULL_EXAMPLE_PATH } from './helpers.js';

describe('ConfigProvider', () => {
  it('loads, resolves, and validates configuration from a file', async () => {
    const provider = new ConfigProvider();
    const result = await provider.loadFromFile(FULL_EXAMPLE_PATH);

    expect(result.fromCache).toBe(false);
    expect(result.validation.success).toBe(true);
    expect(result.config.tenant.slug).toBe('fresh-grocery-pk');
    expect(result.vertical).toBe('grocery');
    expect(Object.isFrozen(result.config)).toBe(true);
  });

  it('returns cached results for repeated resolutions', async () => {
    const provider = new ConfigProvider();
    const first = await provider.loadFromFile(FULL_EXAMPLE_PATH);
    const second = await provider.loadFromFile(FULL_EXAMPLE_PATH);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(second.config).toBe(first.config);
  });

  it('skips cache when skipCache is true', async () => {
    const provider = new ConfigProvider();
    const first = await provider.loadFromFile(FULL_EXAMPLE_PATH);
    const second = await provider.loadFromFile(FULL_EXAMPLE_PATH, { skipCache: true });

    expect(second.fromCache).toBe(false);
    expect(second.config).not.toBe(first.config);
  });

  it('throws when validation is enabled and configuration is invalid', () => {
    const provider = new ConfigProvider();

    expect(() =>
      provider.resolve({
        tenantConfig: {
          tenant: {
            id: '00000000-0000-4000-8000-000000000001',
            slug: 'invalid',
            name: 'Invalid',
            vertical: 'grocery',
            status: 'active',
            defaultLocale: 'en',
            defaultTimezone: 'UTC',
          },
        },
      }),
    ).toThrow(ConfigValidationException);
  });

  it('allows invalid configuration when validation is disabled', () => {
    const provider = new ConfigProvider({ validate: false });

    const result = provider.resolve({
      tenantConfig: {
        tenant: {
          id: '00000000-0000-4000-8000-000000000001',
          slug: 'partial',
          name: 'Partial',
          vertical: 'grocery',
          status: 'active',
          defaultLocale: 'en',
          defaultTimezone: 'UTC',
        },
      },
    });

    expect(result.validation.success).toBe(false);
    expect(result.config.tenant.slug).toBe('partial');
  });

  it('clears cached entries', async () => {
    const provider = new ConfigProvider();
    await provider.loadFromFile(FULL_EXAMPLE_PATH);
    provider.clearCache();

    const result = await provider.loadFromFile(FULL_EXAMPLE_PATH);
    expect(result.fromCache).toBe(false);
  });
});
