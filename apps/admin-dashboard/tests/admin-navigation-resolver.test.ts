import { describe, expect, it } from 'vitest';

import { AdminNavigationResolver } from '../src/domain/admin-navigation-resolver.js';
import { FeatureFlagEvaluator } from '../src/domain/feature-flag-evaluator.js';
import { loadFeatureFlags, loadResolvedTenantConfig, navItem } from './helpers.js';

describe('AdminNavigationResolver', () => {
  const flags = new FeatureFlagEvaluator(loadFeatureFlags());
  const resolver = new AdminNavigationResolver(flags);

  it('keeps visible items from full example admin nav', () => {
    const config = loadResolvedTenantConfig();
    const resolved = resolver.resolve(config.navigation.admin);

    expect(resolved.style).toBe('sidebar');
    expect(resolved.primary.map((item) => item.id)).toEqual([
      'dashboard',
      'orders',
      'catalog',
      'settings',
    ]);
  });

  it('filters invisible and feature-flag-gated items including nested children', () => {
    const resolved = resolver.resolve({
      style: 'sidebar',
      primary: [
        navItem({ id: 'dashboard', label: 'Dashboard', route: 'admin.dashboard' }),
        navItem({
          id: 'hidden',
          label: 'Hidden',
          route: 'admin.hidden',
          visible: false,
        }),
        navItem({
          id: 'reviews',
          label: 'Reviews',
          route: 'admin.reviews',
          featureFlag: 'modules.reviews',
        }),
        navItem({
          id: 'catalog',
          label: 'Catalog',
          route: 'admin.catalog',
          featureFlag: 'modules.catalog',
          children: [
            navItem({
              id: 'wishlist',
              label: 'Wishlist',
              route: 'admin.wishlist',
              featureFlag: 'modules.wishlist',
            }),
            navItem({
              id: 'subs',
              label: 'Substitutions',
              route: 'admin.subs',
              featureFlag: 'grocery.substitutions',
            }),
          ],
        }),
      ],
    });

    expect(resolved.primary.map((item) => item.id)).toEqual(['dashboard', 'catalog']);
    expect(resolved.primary[1]?.children?.map((child) => child.id)).toEqual(['wishlist', 'subs']);
  });
});
