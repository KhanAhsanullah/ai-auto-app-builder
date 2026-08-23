import { describe, expect, it } from 'vitest';

import { FeatureFlagEvaluator } from '../src/domain/feature-flag-evaluator.js';
import { loadFeatureFlags } from './helpers.js';

describe('FeatureFlagEvaluator', () => {
  const flags = new FeatureFlagEvaluator(loadFeatureFlags());

  it('resolves arbitrary flags map keys', () => {
    expect(flags.isEnabled('grocery.substitutions')).toBe(true);
    expect(flags.isEnabled('grocery.missing')).toBe(false);
  });

  it('resolves modules.* and bare module names', () => {
    expect(flags.isEnabled('modules.catalog')).toBe(true);
    expect(flags.isEnabled('catalog')).toBe(true);
    expect(flags.isEnabled('modules.reviews')).toBe(false);
    expect(flags.isEnabled('reviews')).toBe(false);
  });
});
