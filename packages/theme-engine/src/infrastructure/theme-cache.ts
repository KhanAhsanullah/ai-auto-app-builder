import type { CompiledThemeResult, ThemeCacheEntry, ThemeCacheOptions } from '../types.js';

/** In-memory LRU cache for compiled theme artifacts. */
export class ThemeCache {
  private readonly ttlMs?: number;
  private readonly maxEntries: number;
  private readonly store = new Map<string, ThemeCacheEntry<CompiledThemeResult>>();

  constructor(options?: ThemeCacheOptions) {
    this.ttlMs = options?.ttlMs;
    this.maxEntries = options?.maxEntries ?? 100;
  }

  /** Retrieve a cached compiled theme if present and not expired. */
  get(key: string): CompiledThemeResult | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /** Store a compiled theme result in the cache. */
  set(key: string, result: CompiledThemeResult): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.store.set(key, {
      value: result,
      createdAt: now,
      expiresAt: this.ttlMs !== undefined ? now + this.ttlMs : undefined,
    });
  }

  /** Check whether a non-expired entry exists for the key. */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /** Remove a cache entry. Returns true when an entry was removed. */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Remove all cache entries. */
  clear(): void {
    this.store.clear();
  }

  /** Number of entries currently stored (including expired entries). */
  get size(): number {
    return this.store.size;
  }
}
