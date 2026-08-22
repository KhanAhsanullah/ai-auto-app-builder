import { describe, expect, it } from 'vitest';

import { RouteMatcher } from '../src/domain/route-matcher.js';
import { RouteNotFoundException } from '../src/errors.js';

describe('RouteMatcher', () => {
  it('matches static and parameterized routes', () => {
    const matcher = new RouteMatcher();
    matcher.registerAll([
      { method: 'GET', path: '/health', requireTenant: false, name: 'health' },
      { method: 'GET', path: '/v1/products/:id', name: 'product' },
    ]);

    expect(matcher.match('GET', '/health').route.name).toBe('health');
    expect(matcher.match('get', '/v1/products/abc').params).toEqual({ id: 'abc' });
  });

  it('throws when no route matches', () => {
    const matcher = new RouteMatcher();
    matcher.register({ method: 'GET', path: '/health', requireTenant: false });
    expect(() => matcher.match('POST', '/health')).toThrow(RouteNotFoundException);
  });
});
