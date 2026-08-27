import { describe, expect, it } from 'vitest';

import { InMemoryCartRepository } from '../src/infrastructure/in-memory-cart-repository.js';
import type { Cart } from '../src/types.js';

const sample: Cart = {
  tenantId: 'tenant-a',
  id: 'cart-1',
  currency: 'USD',
  sessionId: 'sess-1',
  lines: [],
  subtotal: { amount: 0, currency: 'USD' },
  createdAt: '2026-08-27T12:00:00.000Z',
  updatedAt: '2026-08-27T12:00:00.000Z',
};

describe('InMemoryCartRepository', () => {
  it('saves and finds by session id', async () => {
    const repo = new InMemoryCartRepository();
    await repo.save(sample);
    await expect(repo.findBySessionId('tenant-a', 'sess-1')).resolves.toMatchObject({
      id: 'cart-1',
    });
    await expect(repo.findBySessionId('tenant-b', 'sess-1')).resolves.toBeUndefined();
  });
});
