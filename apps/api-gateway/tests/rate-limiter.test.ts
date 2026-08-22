import { describe, expect, it } from 'vitest';

import { InMemoryRateLimiter } from '../src/domain/rate-limiter.js';

describe('InMemoryRateLimiter', () => {
  it('allows requests under the limit and blocks after', async () => {
    let now = 1_000;
    const limiter = new InMemoryRateLimiter(() => now);

    await expect(limiter.consume({ key: 't1', limit: 2, windowMs: 1_000 })).resolves.toMatchObject({
      allowed: true,
      remaining: 1,
    });
    await expect(limiter.consume({ key: 't1', limit: 2, windowMs: 1_000 })).resolves.toMatchObject({
      allowed: true,
      remaining: 0,
    });
    await expect(limiter.consume({ key: 't1', limit: 2, windowMs: 1_000 })).resolves.toMatchObject({
      allowed: false,
      remaining: 0,
    });

    now = 2_100;
    await expect(limiter.consume({ key: 't1', limit: 2, windowMs: 1_000 })).resolves.toMatchObject({
      allowed: true,
      remaining: 1,
    });
  });
});
