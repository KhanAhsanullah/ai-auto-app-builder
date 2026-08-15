import { createHash } from 'node:crypto';

import type { ProvisioningRequest, Tenant } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';

/** Partial tenant-layer overrides accepted on a provisioning request. */
export type ProvisioningConfigOverrides = ProvisioningRequest['configOverrides'];

/** Identity fields validated and normalized before config construction. */
export interface ValidatedProvisioningIdentity {
  id: string;
  slug: string;
  name: string;
  vertical: Tenant['vertical'];
  defaultLocale: string;
  defaultTimezone: string;
  defaultCountry?: string;
  subscriptionTier?: Tenant['subscriptionTier'];
  configOverrides?: ConfigLayer;
}

/**
 * Canonical input for request fingerprinting (Task 3 idempotency).
 *
 * Computed after ID resolution so an omitted generated ID fingerprints the same
 * as an explicitly supplied equivalent ID. Timestamps are excluded.
 */
export interface ProvisioningRequestFingerprintInput {
  id: string;
  slug: string;
  name: string;
  vertical: Tenant['vertical'];
  defaultLocale: string;
  defaultTimezone: string;
  defaultCountry?: string;
  subscriptionTier?: Tenant['subscriptionTier'];
  configOverrides?: ConfigLayer;
}

/** Persisted tenant registry record. */
export interface TenantRecord {
  tenantId: string;
  slug: string;
  status: Tenant['status'];
  configDocument: ConfigLayer;
  requestFingerprint: string;
  createdAt: string;
  updatedAt: string;
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

/** Compute a deterministic SHA-256 fingerprint for idempotency preparation. */
export function computeRequestFingerprint(input: ProvisioningRequestFingerprintInput): string {
  const payload: ProvisioningRequestFingerprintInput = {
    id: input.id,
    slug: input.slug,
    name: input.name,
    vertical: input.vertical,
    defaultLocale: input.defaultLocale,
    defaultTimezone: input.defaultTimezone,
  };

  if (input.defaultCountry !== undefined) {
    payload.defaultCountry = input.defaultCountry;
  }

  if (input.subscriptionTier !== undefined) {
    payload.subscriptionTier = input.subscriptionTier;
  }

  if (input.configOverrides !== undefined && Object.keys(input.configOverrides).length > 0) {
    payload.configOverrides = input.configOverrides;
  }

  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}
