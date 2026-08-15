import { describe, expect, it } from 'vitest';

import { BrandCache } from '../src/infrastructure/brand-cache.js';

describe('BrandCache', () => {
  it('stores and retrieves compiled brand results', () => {
    const cache = new BrandCache();
    const result = { compiledAt: '2026-01-01T00:00:00.000Z' } as never;

    cache.set('key-1', result);

    expect(cache.get('key-1')).toBe(result);
    expect(cache.has('key-1')).toBe(true);
  });

  it('evicts oldest entry when maxEntries is exceeded', () => {
    const cache = new BrandCache({ maxEntries: 2 });

    cache.set('key-1', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);
    cache.set('key-2', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);
    cache.set('key-3', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    expect(cache.get('key-1')).toBeUndefined();
    expect(cache.get('key-2')).toBeDefined();
    expect(cache.get('key-3')).toBeDefined();
  });

  it('expires entries after ttlMs', () => {
    const cache = new BrandCache({ ttlMs: 1 });
    cache.set('expiring', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    expect(cache.get('expiring')).toBeDefined();

    const start = Date.now();
    while (Date.now() - start < 5) {
      // busy wait for ttl expiry in test environment
    }

    expect(cache.get('expiring')).toBeUndefined();
  });

  it('clears all entries', () => {
    const cache = new BrandCache();
    cache.set('a', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);
    cache.set('b', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('deletes individual entries', () => {
    const cache = new BrandCache();
    cache.set('remove-me', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    expect(cache.delete('remove-me')).toBe(true);
    expect(cache.get('remove-me')).toBeUndefined();
  });
});
