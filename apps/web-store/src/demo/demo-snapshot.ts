import type { Cart } from '@ai-commerce/module-cart';
import type { Category, Product } from '@ai-commerce/module-catalog';
import type { CheckoutSession } from '@ai-commerce/module-checkout';
import type { Order } from '@ai-commerce/module-order';
import type { PaymentIntent } from '@ai-commerce/module-payment';

/** localStorage / memory key for the web demo commerce snapshot. */
export const WEB_DEMO_SNAPSHOT_KEY = '@ai-commerce/web-demo/snapshot/v2';

export interface WebDemoSnapshotStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  /** Optional; when missing, clear writes an empty string. */
  removeItem?(key: string): Promise<void>;
}

/** Serializable demo commerce state (survives browser reloads). */
export interface WebDemoCommerceSnapshot {
  version: 1;
  idSeq: number;
  products: Product[];
  categories: Category[];
  carts: Cart[];
  checkouts: CheckoutSession[];
  orders: Order[];
  payments: PaymentIntent[];
}

export function createMemoryWebDemoSnapshotStore(
  seed: Record<string, string> = {},
): WebDemoSnapshotStore {
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

export function parseWebDemoSnapshot(
  raw: string | null | undefined,
): WebDemoCommerceSnapshot | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as WebDemoCommerceSnapshot;
    if (parsed?.version !== 1 || typeof parsed.idSeq !== 'number') {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

/** Remove the durable demo snapshot so the next bootstrap reseeds a fresh catalog. */
export async function clearWebDemoSnapshot(store: WebDemoSnapshotStore): Promise<void> {
  if (typeof store.removeItem === 'function') {
    await store.removeItem(WEB_DEMO_SNAPSHOT_KEY);
    return;
  }
  await store.setItem(WEB_DEMO_SNAPSHOT_KEY, '');
}

/**
 * Pretty-printed snapshot JSON for export / share, or `null` when nothing is stored.
 */
export async function exportWebDemoSnapshot(store: WebDemoSnapshotStore): Promise<string | null> {
  const raw = await store.getItem(WEB_DEMO_SNAPSHOT_KEY);
  const snapshot = parseWebDemoSnapshot(raw);
  if (!snapshot) {
    return null;
  }
  return JSON.stringify(snapshot, null, 2);
}

/** Lightweight counts for host UI / tests after export. */
export function summarizeWebDemoSnapshot(snapshot: WebDemoCommerceSnapshot): {
  products: number;
  carts: number;
  orders: number;
  payments: number;
} {
  return {
    products: snapshot.products.length,
    carts: snapshot.carts.length,
    orders: snapshot.orders.length,
    payments: snapshot.payments.length,
  };
}
