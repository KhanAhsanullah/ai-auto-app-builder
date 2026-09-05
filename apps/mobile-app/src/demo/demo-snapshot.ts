import type { Cart } from '@ai-commerce/module-cart';
import type { Category, Product } from '@ai-commerce/module-catalog';
import type { CheckoutSession } from '@ai-commerce/module-checkout';
import type { Order } from '@ai-commerce/module-order';
import type { PaymentIntent } from '@ai-commerce/module-payment';

/** AsyncStorage / memory key for the mobile demo commerce snapshot. */
export const DEMO_SNAPSHOT_KEY = '@ai-commerce/mobile-demo/snapshot/v1';

export interface DemoSnapshotStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/** Serializable demo commerce state (survives app restarts). */
export interface DemoCommerceSnapshot {
  version: 1;
  idSeq: number;
  products: Product[];
  categories: Category[];
  carts: Cart[];
  checkouts: CheckoutSession[];
  orders: Order[];
  payments: PaymentIntent[];
}

export function createMemoryDemoSnapshotStore(
  seed: Record<string, string> = {},
): DemoSnapshotStore {
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

export function parseDemoSnapshot(
  raw: string | null | undefined,
): DemoCommerceSnapshot | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as DemoCommerceSnapshot;
    if (parsed?.version !== 1 || typeof parsed.idSeq !== 'number') {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}
