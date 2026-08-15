import { createHash } from 'node:crypto';

import type { PluginManifest } from '@ai-commerce/config-schema';

/** Semantically validated plugin manifest returned by ManifestValidator. */
export type ValidatedPluginManifest = PluginManifest;

/** Persisted platform plugin catalog record. */
export interface PluginCatalogRecord {
  pluginId: string;
  version: string;
  manifest: PluginManifest;
  registeredAt: string;
}

/** Outcome of catalog registration with idempotency metadata. */
export interface CatalogRegistrationResult {
  pluginId: string;
  version: string;
  manifestFingerprint: string;
  registeredAt: string;
  created: boolean;
}

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

  return `{${entries
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
    .join(',')}}`;
}

/** Compute a deterministic SHA-256 fingerprint for catalog idempotency. */
export function computeManifestFingerprint(manifest: PluginManifest): string {
  return createHash('sha256').update(stableStringify(manifest)).digest('hex');
}
