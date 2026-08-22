import type { TokenStore } from '../domain/auth-provider.js';
import type { SyncKeyValueStore } from '../domain/ports.js';

/** In-memory SyncKeyValueStore for tests and non-browser runtimes. */
export class InMemoryKeyValueStore implements SyncKeyValueStore {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.has(key) ? (this.values.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

/**
 * TokenStore backed by a localStorage-compatible SyncKeyValueStore.
 * Suitable for web (`window.localStorage`) or React Native async-bridged sync adapters.
 */
export class PrefixedSecureTokenStore implements TokenStore {
  constructor(
    private readonly store: SyncKeyValueStore,
    private readonly prefix = 'ai-commerce.auth.',
  ) {}

  async get(key: string): Promise<string | undefined> {
    const value = this.store.getItem(this.prefix + key);
    return value === null ? undefined : value;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.setItem(this.prefix + key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.removeItem(this.prefix + key);
  }
}
