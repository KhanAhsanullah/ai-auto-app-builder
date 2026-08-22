/** Minimal HTTP JSON client port for token endpoints (injectable; no live IdP required). */
export interface HttpJsonClient {
  postForm(
    url: string,
    body: Record<string, string>,
  ): Promise<{ status: number; body: Record<string, unknown> }>;
}

/** Synchronous key/value store port (localStorage-compatible). */
export interface SyncKeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Delivers magic-link emails (platform notification adapter in production). */
export interface MagicLinkDeliveryPort {
  send(input: { email: string; magicLinkUrl: string; challengeId: string }): Promise<void>;
}
