import { describe, expect, it } from 'vitest';

import { ThemeCache } from '../src/infrastructure/theme-cache.js';
import { createThemeCompiler } from './helpers.js';

describe('ThemeCache', () => {
  it('stores and retrieves compiled theme results', () => {
    const compiler = createThemeCompiler({ cache: { maxEntries: 10 } });
    const result = compiler.compile({ tenantTheme: { preset: 'modern' } });

    expect(compiler.getCached(result.metadata.hash)).toEqual(result);
  });

  it('evicts oldest entry when maxEntries is exceeded', () => {
    const cache = new ThemeCache({ maxEntries: 2 });
    cache.set('key-1', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);
    cache.set('key-2', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);
    cache.set('key-3', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    expect(cache.has('key-1')).toBe(false);
    expect(cache.has('key-2')).toBe(true);
    expect(cache.has('key-3')).toBe(true);
    expect(cache.size).toBe(2);
  });

  it('expires entries after ttlMs', () => {
    const cache = new ThemeCache({ ttlMs: 1 });
    cache.set('expiring', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    expect(cache.has('expiring')).toBe(true);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache.has('expiring')).toBe(false);
        resolve();
      }, 5);
    });
  });

  it('clears all entries', () => {
    const cache = new ThemeCache();
    cache.set('a', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);
    cache.set('b', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.has('a')).toBe(false);
  });

  it('deletes a specific entry', () => {
    const cache = new ThemeCache();
    cache.set('remove-me', { compiledAt: '2026-01-01T00:00:00.000Z' } as never);

    expect(cache.delete('remove-me')).toBe(true);
    expect(cache.has('remove-me')).toBe(false);
    expect(cache.delete('missing')).toBe(false);
  });
});
