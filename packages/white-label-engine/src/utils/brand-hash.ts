import { createHash } from 'node:crypto';

import type { BrandHashPayload } from '../types.js';

/** Produce a stable JSON string with sorted keys for deterministic hashing. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(',')}}`;
}

/** Compute SHA-256 hash of the canonical resolved branding payload. */
export function computeBrandHash(payload: BrandHashPayload): string {
  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}
