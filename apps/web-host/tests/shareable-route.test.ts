import { describe, expect, it } from 'vitest';

import {
  buildShareablePath,
  parseShareablePath,
  toShareableStoreRoute,
} from '../src/shareable-route.js';

describe('shareable-route', () => {
  it('parses /t/:slug as catalog', () => {
    expect(parseShareablePath('/t/spice-route')).toEqual({
      slug: 'spice-route',
      route: 'store.catalog',
    });
  });

  it('parses screen segments and store/ aliases', () => {
    expect(parseShareablePath('/t/spice-route/cart')).toEqual({
      slug: 'spice-route',
      route: 'store.cart',
    });
    expect(parseShareablePath('/t/spice-route/store/orders')).toEqual({
      slug: 'spice-route',
      route: 'store.orders',
    });
    expect(parseShareablePath('/t/careplus/checkout/')).toEqual({
      slug: 'careplus',
      route: 'store.checkout',
    });
  });

  it('returns undefined for non-shareable paths', () => {
    expect(parseShareablePath('/')).toBeUndefined();
    expect(parseShareablePath('/wizard')).toBeUndefined();
    expect(parseShareablePath('/t/')).toBeUndefined();
    expect(parseShareablePath('/t/Bad_Slug')).toBeUndefined();
  });

  it('falls back unknown screens to catalog', () => {
    expect(parseShareablePath('/t/spice-route/unknown')).toEqual({
      slug: 'spice-route',
      route: 'store.catalog',
    });
  });

  it('builds shareable paths', () => {
    expect(buildShareablePath('Spice-Route')).toBe('/t/spice-route');
    expect(buildShareablePath('spice-route', 'store.cart')).toBe('/t/spice-route/cart');
    expect(buildShareablePath('spice-route', 'store.orders')).toBe('/t/spice-route/orders');
    expect(buildShareablePath('spice-route', 'store.about')).toBe('/t/spice-route/about');
    expect(buildShareablePath('spice-route', 'store.contact')).toBe('/t/spice-route/contact');
  });

  it('parses about and contact screens', () => {
    expect(parseShareablePath('/t/spice-route/about')).toEqual({
      slug: 'spice-route',
      route: 'store.about',
    });
    expect(parseShareablePath('/t/spice-route/contact')).toEqual({
      slug: 'spice-route',
      route: 'store.contact',
    });
  });

  it('normalizes store routes', () => {
    expect(toShareableStoreRoute('store.payment')).toBe('store.payment');
    expect(toShareableStoreRoute('nope')).toBe('store.catalog');
  });
});
