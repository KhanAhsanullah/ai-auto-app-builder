import type { WebDemoSnapshotStore } from '@ai-commerce/web-store';

import type { SessionStore } from './session-storage.js';

export type WebHostKvStore = SessionStore & WebDemoSnapshotStore;

/**
 * Wrap `window.localStorage` as the async demo KV store (session + snapshot).
 */
export function createLocalStorageKvStore(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = globalThis.localStorage,
): WebHostKvStore {
  return {
    async getItem(key) {
      return storage.getItem(key);
    },
    async setItem(key, value) {
      storage.setItem(key, value);
    },
    async removeItem(key) {
      storage.removeItem(key);
    },
  };
}
