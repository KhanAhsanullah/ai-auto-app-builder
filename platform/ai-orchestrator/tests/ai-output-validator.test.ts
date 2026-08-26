import { describe, expect, it } from 'vitest';

import { AiOutputValidator } from '../src/domain/ai-output-validator.js';
import {
  VALID_BRANDING_PAYLOAD,
  VALID_NAVIGATION_PAYLOAD,
  VALID_THEME_PAYLOAD,
} from './helpers.js';

describe('AiOutputValidator', () => {
  const validator = new AiOutputValidator();

  it('accepts a valid theme payload', () => {
    expect(validator.validate('theme', VALID_THEME_PAYLOAD)).toEqual({
      success: true,
      errors: [],
    });
  });

  it('rejects an invalid theme payload with path messages', () => {
    const result = validator.validate('theme', { preset: 'modern' });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts valid branding (copy) and navigation payloads', () => {
    expect(validator.validate('copy', VALID_BRANDING_PAYLOAD).success).toBe(true);
    expect(validator.validate('navigation', VALID_NAVIGATION_PAYLOAD).success).toBe(true);
  });

  it('accepts non-empty config patches and rejects empty ones', () => {
    expect(validator.validate('config', { branding: { appName: 'X' } }).success).toBe(true);
    expect(validator.validate('config', {}).success).toBe(false);
    expect(validator.validate('config', null).success).toBe(false);
  });

  it('validates catalog enrichment shape', () => {
    expect(
      validator.validate('catalog', {
        productId: 'sku-1',
        description: 'Fresh apples',
        categories: ['produce'],
      }).success,
    ).toBe(true);

    expect(validator.validate('catalog', { productId: '' }).success).toBe(false);
    expect(validator.validate('menu_import', { productId: 'sku-1' }).success).toBe(true);
  });
});
