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

/** Runtime lifecycle status for a tenant plugin binding. */
export type TenantPluginStatus = 'installed' | 'enabled' | 'disabled';

/** Plugin settings compatible with tenant config metadata. */
export type PluginSettings = Record<string, string | number | boolean | null>;

/** Exact resolved dependency chosen from a semver range at install time. */
export interface ResolvedPluginDependency {
  pluginId: string;
  requestedRange: string;
  resolvedVersion: string;
}

/** Persisted tenant plugin runtime binding. */
export interface TenantPluginRecord {
  tenantId: string;
  pluginId: string;
  version: string;
  status: TenantPluginStatus;
  settings?: PluginSettings;
  resolvedDependencies: ResolvedPluginDependency[];
  installFingerprint: string;
  installedAt: string;
  updatedAt: string;
}

/** Outcome of tenant plugin installation. */
export interface InstallResult {
  tenantId: string;
  pluginId: string;
  version: string;
  status: 'installed';
  resolvedDependencies: ResolvedPluginDependency[];
  installFingerprint: string;
  created: boolean;
  installedAt: string;
}

/** Outcome of a tenant plugin lifecycle operation. */
export interface LifecycleResult {
  tenantId: string;
  pluginId: string;
  version: string;
  status: TenantPluginStatus;
  changed: boolean;
  updatedAt: string;
}

/** Per-file discovery outcome. */
export type DiscoveryEntryStatus = 'registered' | 'skipped' | 'failed';

export interface DiscoveryEntry {
  path: string;
  status: DiscoveryEntryStatus;
  pluginId?: string;
  version?: string;
  error?: string;
}

/** Aggregated filesystem discovery result. */
export interface DiscoveryResult {
  rootPath: string;
  discovered: number;
  registered: number;
  skipped: number;
  failed: number;
  entries: DiscoveryEntry[];
}

/** Scanned manifest file on disk. */
export interface ScannedManifestFile {
  absolutePath: string;
  relativePath: string;
}

/** Produce a stable JSON string with sorted keys for deterministic hashing. */
export function stableStringify(value: unknown): string {
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

/** Input for install idempotency fingerprinting. */
export interface InstallFingerprintInput {
  tenantId: string;
  pluginId: string;
  version: string;
  settings?: PluginSettings;
  resolvedDependencies: ResolvedPluginDependency[];
}

/** Compute a deterministic SHA-256 fingerprint for install idempotency. */
export function computeInstallFingerprint(input: InstallFingerprintInput): string {
  const payload: InstallFingerprintInput = {
    tenantId: input.tenantId,
    pluginId: input.pluginId,
    version: input.version,
    resolvedDependencies: input.resolvedDependencies,
  };

  if (input.settings !== undefined) {
    payload.settings = input.settings;
  }

  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}

/**
 * Invocation envelope passed to in-process plugin handlers.
 * Caller payload lives in `context`; permissions are metadata only (not enforced in Sprint 5).
 */
export interface HookInvocationContext<TContext = unknown> {
  tenantId: string;
  hookPoint: string;
  pluginId: string;
  handlerId: string;
  version: string;
  permissions: readonly string[];
  context: TContext;
}

/** In-process handler function registered by the host (D5). */
export type PluginHandlerFn<TContext = unknown> = (
  invocation: HookInvocationContext<TContext>,
) => void | Promise<void>;

/** Input for global handler registration keyed by (pluginId, handlerId). */
export interface RegisterHandlerInput<TContext = unknown> {
  pluginId: string;
  handlerId: string;
  handler: PluginHandlerFn<TContext>;
}

/** Tenant-scoped active handler binding used by the dispatcher. */
export interface TenantHandlerActivation {
  tenantId: string;
  pluginId: string;
  version: string;
  hookPoint: string;
  handlerId: string;
  priority: number;
  permissions: readonly string[];
}

/** Input for tenant-scoped hook dispatch. */
export interface HookDispatchInput<TContext = unknown> {
  tenantId: string;
  hookPoint: string;
  context: TContext;
}

/** Per-handler outcome collected during dispatch. */
export interface HookHandlerOutcome {
  pluginId: string;
  handlerId: string;
  success: boolean;
  error?: string;
}

/** Aggregated result of a hook dispatch invocation. */
export interface HookDispatchResult {
  tenantId: string;
  hookPoint: string;
  invoked: number;
  outcomes: HookHandlerOutcome[];
}

/** Minimal typed payload aliases for known hook points (v1). */
export type ThemePresetsExtendContext = unknown;
export type ThemeResolveAfterContext = unknown;
export type ConfigValidateAfterContext = unknown;
export type TenantProvisionAfterContext = unknown;
