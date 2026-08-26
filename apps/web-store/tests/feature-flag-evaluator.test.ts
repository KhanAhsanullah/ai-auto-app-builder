import { describe, expect, it } from 'vitest';

import { FeatureFlagEvaluator } from '../src/domain/feature-flag-evaluator.js';
import { loadFeatureFlags } from './helpers.js';

describe('FeatureFlagEvaluator', () => {
  it('evaluates flags.* and modules.* keys', () => {
    const flags = loadFeatureFlags();
    const evaluator = new FeatureFlagEvaluator(flags);

    expect(evaluator.isEnabled('')).toBe(false);
    expect(typeof evaluator.isEnabled('modules.catalog')).toBe('boolean');
    expect(evaluator.raw).toBe(flags);
  });
});
