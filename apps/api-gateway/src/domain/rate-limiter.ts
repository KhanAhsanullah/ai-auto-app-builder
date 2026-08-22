import type { RateLimitDecision } from '../types.js';

/** Rate limiter port for gateway middleware. */
export interface RateLimiter {
  consume(input: { key: string; limit: number; windowMs: number }): Promise<RateLimitDecision>;
}

/** Fixed-window in-memory rate limiter (Task 1 default). */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly clock: () => number = () => Date.now()) {}

  async consume(input: {
    key: string;
    limit: number;
    windowMs: number;
  }): Promise<RateLimitDecision> {
    const now = this.clock();
    const existing = this.windows.get(input.key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + input.windowMs;
      this.windows.set(input.key, { count: 1, resetAt });
      return {
        allowed: true,
        limit: input.limit,
        remaining: Math.max(0, input.limit - 1),
        resetAt,
      };
    }

    if (existing.count >= input.limit) {
      return {
        allowed: false,
        limit: input.limit,
        remaining: 0,
        resetAt: existing.resetAt,
      };
    }

    existing.count += 1;
    this.windows.set(input.key, existing);

    return {
      allowed: true,
      limit: input.limit,
      remaining: Math.max(0, input.limit - existing.count),
      resetAt: existing.resetAt,
    };
  }
}
