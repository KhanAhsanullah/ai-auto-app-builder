import { describe, expect, it } from 'vitest';

import { FeatureFlagEvaluator } from '../src/domain/feature-flag-evaluator.js';
import { loadFeatureFlags } from './helpers.js';

describe('FeatureFlagEvaluator', () => {
  const flags = new FeatureFlagEvaluator(loadFeatureFlags());

  it('resolves flags and modules keys', () => {
    expect(flags.isEnabled('grocery.deliverySlots')).toBe(true);
    expect(flags.isEnabled('modules.catalog')).toBe(true);
    expect(flags.isEnabled('modules.reviews')).toBe(false);
  });
});
