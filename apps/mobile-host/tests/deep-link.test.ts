import { describe, expect, it } from 'vitest';

import { parseDeepLinkRoute } from '../src/deep-link.js';

describe('parseDeepLinkRoute', () => {
  it('parses custom scheme store paths', () => {
    expect(parseDeepLinkRoute('aicommerce://store/cart')).toBe('store.cart');
    expect(parseDeepLinkRoute('aicommerce://store/orders')).toBe('store.orders');
  });

  it('parses short custom-scheme hosts', () => {
    expect(parseDeepLinkRoute('aicommerce://cart')).toBe('store.cart');
    expect(parseDeepLinkRoute('aicommerce://catalog')).toBe('store.catalog');
  });

  it('parses https and Expo Go style paths', () => {
    expect(parseDeepLinkRoute('https://demo.example/store/checkout')).toBe('store.checkout');
    expect(parseDeepLinkRoute('exp://127.0.0.1:8081/--/store/payment')).toBe('store.payment');
  });

  it('rejects unknown routes', () => {
    expect(parseDeepLinkRoute('aicommerce://store/unknown')).toBeUndefined();
    expect(parseDeepLinkRoute('')).toBeUndefined();
    expect(parseDeepLinkRoute(null)).toBeUndefined();
  });
});
