import { describe, expect, it } from 'vitest';

import { deepMerge, shallowMergeBrandSections } from '../src/utils/deep-merge.js';

describe('deepMerge', () => {
  it('merges nested objects without dropping sibling keys', () => {
    const merged = deepMerge(
      { logo: { primary: 'a', inverse: 'b' }, appName: 'Platform' },
      { logo: { primary: 'c' } },
    );

    expect(merged).toEqual({
      logo: { primary: 'c', inverse: 'b' },
      appName: 'Platform',
    });
  });
});

describe('shallowMergeBrandSections', () => {
  it('replaces nested section keys without deep-merging grandchildren', () => {
    const merged = shallowMergeBrandSections(
      { logo: { primary: 'a', inverse: 'b', favicon: 'c' } },
      { logo: { primary: 'z' } },
    );

    expect(merged).toEqual({
      logo: { primary: 'z', inverse: 'b', favicon: 'c' },
    });
  });
});
