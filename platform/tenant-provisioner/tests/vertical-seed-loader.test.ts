import type { Tenant } from '@ai-commerce/config-schema';
import { describe, expect, it } from 'vitest';

import { VerticalSeedLoader } from '../src/infrastructure/vertical-seed-loader.js';

const VERTICALS: Tenant['vertical'][] = [
  'ecommerce',
  'grocery',
  'restaurant',
  'pharmacy',
  'fashion',
  'electronics',
];

describe('VerticalSeedLoader', () => {
  const loader = new VerticalSeedLoader();

  it.each(VERTICALS)('loads %s seed successfully', (vertical) => {
    const seed = loader.load(vertical);

    expect(seed).toBeDefined();
    expect(Object.keys(seed).length).toBeGreaterThan(0);
  });

  it('returns deterministic seed output for the same vertical', () => {
    const first = loader.load('grocery');
    const second = loader.load('grocery');

    expect(first).toEqual(second);
  });

  it.each(VERTICALS)('does not include meta, tenant, or environment in %s seed', (vertical) => {
    const seed = loader.load(vertical);

    expect(seed.meta).toBeUndefined();
    expect(seed.tenant).toBeUndefined();
    expect(seed.environment).toBeUndefined();
  });

  it('returns empty seed for an unknown vertical', () => {
    const seed = loader.load('unknown-vertical' as Tenant['vertical']);

    expect(seed).toEqual({});
  });

  it('strips forbidden top-level keys from seed payloads', () => {
    const loaderWithFixture = new VerticalSeedLoader();
    const sanitized = loaderWithFixture.load('ecommerce');

    expect(sanitized.featureFlags).toBeUndefined();
    expect(sanitized.payments).toBeUndefined();
    expect(sanitized.authentication).toBeUndefined();
  });

  it('produces different branding between ecommerce and grocery seeds', () => {
    const ecommerce = loader.load('ecommerce');
    const grocery = loader.load('grocery');

    expect(ecommerce.branding?.tagline).not.toBe(grocery.branding?.tagline);
  });
});
