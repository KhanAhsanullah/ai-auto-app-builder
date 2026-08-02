import { describe, expect, it } from 'vitest';

import { ConfigValidator } from '../src/config-validator.js';
import { ConfigValidationException } from '../src/errors.js';
import { FULL_EXAMPLE_PATH } from './helpers.js';
import { ConfigLoader } from '../src/config-loader.js';
import { ConfigResolver } from '../src/config-resolver.js';

describe('ConfigValidator', () => {
  const validator = new ConfigValidator();
  const loader = new ConfigLoader();
  const resolver = new ConfigResolver();

  it('validates a fully resolved tenant configuration', async () => {
    const tenantConfig = await loader.loadFromFile(FULL_EXAMPLE_PATH);
    const resolved = resolver.resolve({ tenantConfig });

    const result = validator.validate(resolved.config);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.tenant.slug).toBe('fresh-grocery-pk');
  });

  it('returns human-readable errors for invalid configuration', () => {
    const result = validator.validate({ tenant: { slug: 'missing-required-fields' } });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.path).toBeTruthy();
    expect(result.errors[0]?.message).toBeTruthy();
  });

  it('throws ConfigValidationException from validateOrThrow', () => {
    expect(() => validator.validateOrThrow({})).toThrow(ConfigValidationException);
  });
});
