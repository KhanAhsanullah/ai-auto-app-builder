/** Storage key for the guest commerce session id (legacy / unscoped). */
export const WEB_HOST_SESSION_KEY = '@ai-commerce/web-host/session-id';

export interface SessionStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?(key: string): Promise<void>;
}

/** Per-tenant session key (falls back to legacy global key when id omitted). */
export function webHostSessionKey(tenantId?: string): string {
  const id = tenantId?.trim();
  return id ? `${WEB_HOST_SESSION_KEY}:${id}` : WEB_HOST_SESSION_KEY;
}

/** In-memory store for unit tests. */
export function createMemorySessionStore(seed: Record<string, string> = {}): SessionStore {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

/** Drop the persisted guest session so the next resolve creates a new id. */
export async function clearGuestSession(
  store: SessionStore,
  options?: { tenantId?: string },
): Promise<void> {
  const key = webHostSessionKey(options?.tenantId);
  if (typeof store.removeItem === 'function') {
    await store.removeItem(key);
    return;
  }
  await store.setItem(key, '');
}

/**
 * Load existing guest session or create + persist a new one.
 */
export async function resolveGuestSessionId(input: {
  store: SessionStore;
  tenantId?: string;
  preferred?: string;
  createId?: () => string;
}): Promise<string> {
  const key = webHostSessionKey(input.tenantId);
  const preferred = input.preferred?.trim();
  if (preferred) {
    await input.store.setItem(key, preferred);
    return preferred;
  }

  const existing = (await input.store.getItem(key))?.trim();
  if (existing) {
    return existing;
  }

  const created =
    input.createId?.().trim() ||
    `web-demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await input.store.setItem(key, created);
  return created;
}
