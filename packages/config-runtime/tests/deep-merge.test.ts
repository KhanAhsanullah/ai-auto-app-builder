import { describe, expect, it } from 'vitest';

import { deepMerge, shallowMergeSections } from '../src/deep-merge.js';

describe('deepMerge', () => {
  it('merges nested objects with later layers winning', () => {
    const result = deepMerge(
      { theme: { colors: { primary: '#000000', secondary: '#111111' } } },
      { theme: { colors: { primary: '#FFFFFF' } } },
    );

    expect(result).toEqual({
      theme: { colors: { primary: '#FFFFFF', secondary: '#111111' } },
    });
  });

  it('replaces arrays instead of concatenating', () => {
    const result = deepMerge(
      { payments: { methods: ['card'] } },
      { payments: { methods: ['wallet', 'cash_on_delivery'] } },
    );

    expect(result.payments?.methods).toEqual(['wallet', 'cash_on_delivery']);
  });

  it('skips undefined source values', () => {
    const result = deepMerge({ tenant: { name: 'Acme' } }, { tenant: { slug: 'acme' } });

    expect(result).toEqual({ tenant: { name: 'Acme', slug: 'acme' } });
  });
});

describe('shallowMergeSections', () => {
  it('merges top-level sections one level deep', () => {
    const result = shallowMergeSections(
      {
        payments: {
          defaultGateway: 'stripe',
          checkout: { captureStrategy: 'immediate' },
        },
      },
      {
        payments: {
          defaultGateway: 'paypal',
        },
      },
    );

    expect(result.payments).toEqual({
      defaultGateway: 'paypal',
      checkout: { captureStrategy: 'immediate' },
    });
  });
});
