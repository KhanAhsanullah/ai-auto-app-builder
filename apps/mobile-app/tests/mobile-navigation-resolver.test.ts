import { describe, expect, it } from 'vitest';

import { FeatureFlagEvaluator } from '../src/domain/feature-flag-evaluator.js';
import { MobileNavigationResolver } from '../src/domain/mobile-navigation-resolver.js';
import { loadFeatureFlags, loadResolvedTenantConfig, navItem } from './helpers.js';

describe('MobileNavigationResolver', () => {
  const flags = new FeatureFlagEvaluator(loadFeatureFlags());
  const resolver = new MobileNavigationResolver(flags);

  it('keeps visible items from full example mobile nav', () => {
    const config = loadResolvedTenantConfig();
    const resolved = resolver.resolve(config.navigation.mobile);

    expect(resolved.style).toBe('bottom-bar');
    expect(resolved.primary.map((item) => item.id)).toEqual(['home', 'shop', 'orders', 'profile']);
  });

  it('filters invisible and feature-flag-gated items', () => {
    const resolved = resolver.resolve({
      style: 'bottom-bar',
      primary: [
        navItem({ id: 'home', label: 'Home', route: 'store.home' }),
        navItem({
          id: 'hidden',
          label: 'Hidden',
          route: 'store.hidden',
          visible: false,
        }),
        navItem({
          id: 'reviews',
          label: 'Reviews',
          route: 'store.reviews',
          featureFlag: 'modules.reviews',
        }),
        navItem({
          id: 'shop',
          label: 'Shop',
          route: 'store.catalog',
          featureFlag: 'modules.catalog',
        }),
      ],
    });

    expect(resolved.primary.map((item) => item.id)).toEqual(['home', 'shop']);
  });
});
