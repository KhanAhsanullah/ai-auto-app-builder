import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PluginManifest } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import { ConfigProvider } from '@ai-commerce/config-runtime';

import { CatalogService } from '../src/domain/catalog-service.js';
import { DependencyResolver } from '../src/domain/dependency-resolver.js';
import { InstallService } from '../src/domain/install-service.js';
import { ManifestValidator } from '../src/domain/manifest-validator.js';
import { PluginLifecycleService } from '../src/domain/plugin-lifecycle-service.js';
import { PluginSettingsValidator } from '../src/domain/plugin-settings-validator.js';
import type { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import type { InMemoryTenantPluginRepository } from '../src/infrastructure/in-memory-tenant-plugin-repository.js';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '../../..');

export const FULL_TENANT_CONFIG_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/full.example.json',
);

export const FIXED_CLOCK = '2026-08-16T00:00:00.000Z';
export const TENANT_ID = '11111111-1111-4111-8111-111111111111';

export const VALID_PLUGIN_MANIFEST: PluginManifest = {
  id: 'com.commerceos.theme.contrast',
  name: 'Contrast Theme Extension',
  description: 'Adds high-contrast preset extensions.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: ['theme.read'],
  hooks: [
    {
      point: 'theme.presets.extend',
      handler: 'extendPresets',
      priority: 100,
    },
    {
      point: 'theme.resolve.after',
      handler: 'adjustResolvedTheme',
    },
  ],
  dependencies: [],
  configSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      contrastLevel: {
        type: 'string',
        enum: ['normal', 'high'],
      },
    },
  },
};

export const VALID_PLUGIN_MANIFEST_V2: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  version: '2.0.0',
  description: 'Second major release of the contrast theme extension.',
};

export const PLUGIN_MANIFEST_WITH_DEPENDENCY: PluginManifest = {
  id: 'com.commerceos.theme.bundle',
  name: 'Theme Bundle',
  description: 'Bundle depending on contrast extension.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: ['theme.read'],
  hooks: [{ point: 'theme.presets.extend', handler: 'bundlePresets' }],
  dependencies: [{ id: 'com.commerceos.theme.contrast', versionRange: '^1.0.0' }],
};

export const PLUGIN_MANIFEST_WITH_CYCLE_A: PluginManifest = {
  id: 'com.commerceos.cycle.a',
  name: 'Cycle A',
  description: 'Cycle test plugin A.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: [],
  hooks: [],
  dependencies: [{ id: 'com.commerceos.cycle.b', versionRange: '^1.0.0' }],
};

export const PLUGIN_MANIFEST_WITH_CYCLE_B: PluginManifest = {
  id: 'com.commerceos.cycle.b',
  name: 'Cycle B',
  description: 'Cycle test plugin B.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: [],
  hooks: [],
  dependencies: [{ id: 'com.commerceos.cycle.a', versionRange: '^1.0.0' }],
};

export const PLUGIN_MANIFEST_NO_CONFIG_SCHEMA: PluginManifest = {
  id: 'com.commerceos.simple.plugin',
  name: 'Simple Plugin',
  description: 'Plugin without configSchema.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: [],
  hooks: [],
};

export const INVALID_PLUGIN_MANIFEST_UNKNOWN_HOOK: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  hooks: [{ point: 'unknown.hook.point', handler: 'noop' }],
};

export const INVALID_PLUGIN_MANIFEST_DUPLICATE_HOOK: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  hooks: [
    { point: 'theme.presets.extend', handler: 'extendPresets' },
    { point: 'theme.presets.extend', handler: 'extendPresets' },
  ],
};

export const INVALID_PLUGIN_MANIFEST_BAD_ENGINE_RANGE: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  engineVersion: 'not-a-range',
};

export const INVALID_PLUGIN_MANIFEST_INCOMPATIBLE_ENGINE: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  engineVersion: '^6.0.0',
};

export const INVALID_PLUGIN_MANIFEST_BAD_DEPENDENCY_RANGE: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  dependencies: [{ id: 'com.commerceos.other', versionRange: 'latest' }],
};

export const INVALID_PLUGIN_MANIFEST_INVALID_CONFIG_SCHEMA: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  configSchema: {
    type: 'string',
  },
};

export const INVALID_PLUGIN_MANIFEST_DUPLICATE_PERMISSION: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  permissions: ['theme.read', 'theme.read'],
};

export const INVALID_PLUGIN_MANIFEST_BAD_ID: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  id: 'InvalidPluginId',
};

/** Load the canonical full tenant config example as a ConfigLayer. */
export function loadFullTenantConfig(): ConfigLayer {
  return JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8')) as ConfigLayer;
}

/** Build tenant config with a plugin declaration entry for install tests. */
export function createTenantConfigWithPlugin(options?: {
  pluginId?: string;
  version?: string;
  enabled?: boolean;
  settings?: Record<string, string | number | boolean | null>;
}): ConfigLayer {
  const pluginId = options?.pluginId ?? VALID_PLUGIN_MANIFEST.id;
  const version = options?.version ?? VALID_PLUGIN_MANIFEST.version;

  const base = loadFullTenantConfig();

  return {
    ...base,
    integrations: {
      ...base.integrations,
      plugins: [
        {
          id: pluginId,
          version,
          enabled: options?.enabled ?? false,
          settings: options?.settings,
        },
      ],
    },
  };
}

export async function seedCatalog(
  catalogRepository: InMemoryPluginCatalogRepository,
  manifests: PluginManifest[] = [VALID_PLUGIN_MANIFEST],
) {
  const catalogService = new CatalogService({
    validator: new ManifestValidator(),
    repository: catalogRepository,
    clock: () => FIXED_CLOCK,
  });

  for (const manifest of manifests) {
    await catalogService.register(manifest);
  }
}

export function createInstallService(options: {
  catalogRepository: InMemoryPluginCatalogRepository;
  tenantPluginRepository: InMemoryTenantPluginRepository;
  configProvider?: ConfigProvider;
}) {
  return new InstallService({
    catalogRepository: options.catalogRepository,
    tenantPluginRepository: options.tenantPluginRepository,
    dependencyResolver: new DependencyResolver(options.catalogRepository),
    settingsValidator: new PluginSettingsValidator(),
    configProvider: options.configProvider ?? new ConfigProvider({ cache: false }),
    clock: () => FIXED_CLOCK,
  });
}

export function createLifecycleService(
  tenantPluginRepository: InMemoryTenantPluginRepository,
  configProvider?: ConfigProvider,
) {
  return new PluginLifecycleService({
    tenantPluginRepository,
    configProvider: configProvider ?? new ConfigProvider({ cache: false }),
    clock: () => FIXED_CLOCK,
  });
}
