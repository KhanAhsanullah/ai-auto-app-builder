import { describe, expect, it } from 'vitest';

import { FeatureFlagEvaluator } from '../src/domain/feature-flag-evaluator.js';
import { WebNavigationResolver } from '../src/domain/web-navigation-resolver.js';
import { loadFeatureFlags, navItem } from './helpers.js';

describe('WebNavigationResolver', () => {
  it('filters invisible and flag-gated items; defaults style to top-bar', () => {
    const flags = loadFeatureFlags();
    const resolver = new WebNavigationResolver(new FeatureFlagEvaluator(flags));

    const navigation = resolver.resolve({
      primary: [
        navItem({ id: 'home', label: 'Home', route: 'store.home' }),
        navItem({ id: 'hidden', label: 'Hidden', route: 'store.hidden', visible: false }),
        navItem({
          id: 'gated',
          label: 'Gated',
          route: 'store.gated',
          featureFlag: 'this-flag-does-not-exist',
        }),
      ],
      footer: [navItem({ id: 'about', label: 'About', route: 'store.about' })],
    });

    expect(navigation.style).toBe('top-bar');
    expect(navigation.primary.map((i) => i.id)).toEqual(['home']);
    expect(navigation.footer.map((i) => i.id)).toEqual(['about']);
  });
});
