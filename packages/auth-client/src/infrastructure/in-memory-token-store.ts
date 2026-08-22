import type { TokenStore } from '../domain/auth-provider.js';

/** In-memory token store for tests and local development. */
export class InMemoryTokenStore implements TokenStore {
  private readonly values = new Map<string, string>();

  async get(key: string): Promise<string | undefined> {
    return this.values.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key);
  }
}
