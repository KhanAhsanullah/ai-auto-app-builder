/** Storage key for the guest commerce session id. */
export const MOBILE_HOST_SESSION_KEY = '@ai-commerce/mobile-host/session-id';

export interface SessionStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/** In-memory store for unit tests (and SSR-safe fallback). */
export function createMemorySessionStore(seed: Record<string, string> = {}): SessionStore {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
  };
}

/**
 * Load existing guest session or create + persist a new one.
 */
export async function resolveGuestSessionId(input: {
  store: SessionStore;
  preferred?: string;
  createId?: () => string;
}): Promise<string> {
  const preferred = input.preferred?.trim();
  if (preferred) {
    await input.store.setItem(MOBILE_HOST_SESSION_KEY, preferred);
    return preferred;
  }

  const existing = (await input.store.getItem(MOBILE_HOST_SESSION_KEY))?.trim();
  if (existing) {
    return existing;
  }

  const created =
    input.createId?.().trim() ||
    `mobile-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await input.store.setItem(MOBILE_HOST_SESSION_KEY, created);
  return created;
}
