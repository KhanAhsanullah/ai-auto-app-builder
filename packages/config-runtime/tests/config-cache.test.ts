import { describe, expect, it, vi } from 'vitest';

import { ConfigCache } from '../src/config-cache.js';

describe('ConfigCache', () => {
  it('stores and retrieves configuration entries', () => {
    const cache = new ConfigCache();
    const config = { tenant: { vertical: 'grocery' } } as never;

    cache.set('tenant-a', config);
    expect(cache.get('tenant-a')).toBe(config);
    expect(cache.has('tenant-a')).toBe(true);
  });

  it('evicts the oldest entry when maxEntries is exceeded', () => {
    const cache = new ConfigCache({ maxEntries: 2 });
    cache.set('one', { id: 1 } as never);
    cache.set('two', { id: 2 } as never);
    cache.set('three', { id: 3 } as never);

    expect(cache.get('one')).toBeUndefined();
    expect(cache.get('two')).toBeDefined();
    expect(cache.get('three')).toBeDefined();
  });

  it('expires entries after ttlMs', () => {
    vi.useFakeTimers();

    const cache = new ConfigCache({ ttlMs: 1_000 });
    cache.set('tenant-a', { id: 1 } as never);

    expect(cache.get('tenant-a')).toBeDefined();

    vi.advanceTimersByTime(1_001);

    expect(cache.get('tenant-a')).toBeUndefined();

    vi.useRealTimers();
  });

  it('clears all entries', () => {
    const cache = new ConfigCache();
    cache.set('tenant-a', { id: 1 } as never);
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('tenant-a')).toBeUndefined();
  });
});
