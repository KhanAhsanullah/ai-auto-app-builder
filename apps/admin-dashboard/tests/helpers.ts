import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConfigProvider } from '@ai-commerce/config-runtime';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import type { FeatureFlags, TenantConfiguration } from '@ai-commerce/config-schema';

import type { AdminNavItem } from '../src/types.js';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '../../..');

export const FULL_TENANT_CONFIG_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/full.example.json',
);

export function loadFullTenantConfigLayer(): ConfigLayer {
  return JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8')) as ConfigLayer;
}

/** Resolve the full example through Config Runtime into a validated TenantConfiguration. */
export function loadResolvedTenantConfig(): TenantConfiguration {
  const provider = new ConfigProvider({ cache: false });
  const result = provider.resolve({
    tenantConfig: loadFullTenantConfigLayer(),
    skipCache: true,
  });
  if (!result.validation.success || !result.config) {
    throw new Error('Failed to resolve full.example.json through ConfigProvider.');
  }
  return result.config;
}

export function loadFeatureFlags(): FeatureFlags {
  return loadResolvedTenantConfig().featureFlags;
}

export function navItem(
  partial: Partial<AdminNavItem> & Pick<AdminNavItem, 'id' | 'label' | 'route'>,
): AdminNavItem {
  return partial;
}
