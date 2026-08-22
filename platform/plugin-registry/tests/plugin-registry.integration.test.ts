import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { ConfigProvider } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import { CatalogService } from '../src/domain/catalog-service.js';
import { DiscoveryService } from '../src/domain/discovery-service.js';
import { ManifestValidator } from '../src/domain/manifest-validator.js';
import { createPluginRegistry } from '../src/infrastructure/create-plugin-registry.js';
import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import { InMemoryTenantPluginRepository } from '../src/infrastructure/in-memory-tenant-plugin-repository.js';
import {
  createInstallService,
  createLifecycleService,
  createTenantConfigWithPlugin,
  FIXED_CLOCK,
  PLUGIN_MANIFEST_WITH_DEPENDENCY,
  TENANT_ID,
  VALID_PLUGIN_MANIFEST,
} from './helpers.js';

describe('Plugin registry integration', () => {
  it('discovers, installs, enables, and uninstalls a plugin with ConfigProvider gate', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-integration-'));

    try {
      await writeFile(
        join(root, 'contrast.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST, null, 2)}\n`,
        'utf8',
      );

      const catalogRepository = new InMemoryPluginCatalogRepository();
      const tenantPluginRepository = new InMemoryTenantPluginRepository();
      const configProvider = new ConfigProvider({ cache: false });

      const discovery = new DiscoveryService({
        catalogService: new CatalogService({
          validator: new ManifestValidator(),
          repository: catalogRepository,
        }),
      });

      const discoveryResult = await discovery.discoverFromDirectory(root);
      expect(discoveryResult.registered).toBe(1);

      const tenantConfig = createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      });

      const installService = createInstallService({
        catalogRepository,
        tenantPluginRepository,
        configProvider,
      });

      const installResult = await installService.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        settings: { contrastLevel: 'high' },
        tenantConfig,
      });

      expect(installResult.created).toBe(true);
      expect(installResult.status).toBe('installed');

      const lifecycle = createLifecycleService(tenantPluginRepository, configProvider);
      const enabled = await lifecycle.enable({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        tenantConfig,
      });

      expect(enabled.status).toBe('enabled');

      const resolved = configProvider.resolve({
        tenantConfig,
        skipCache: true,
      });
      expect(resolved.validation.success).toBe(true);

      await lifecycle.uninstall({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
      });

      await expect(
        tenantPluginRepository.findByTenantAndPlugin(TENANT_ID, VALID_PLUGIN_MANIFEST.id),
      ).resolves.toBeUndefined();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('resolves dependencies during install when discovered from disk', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-integration-deps-'));

    try {
      await mkdir(join(root, 'deps'), { recursive: true });
      await writeFile(
        join(root, 'deps', 'contrast.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST, null, 2)}\n`,
        'utf8',
      );
      await writeFile(
        join(root, 'bundle.plugin-manifest.json'),
        `${JSON.stringify(PLUGIN_MANIFEST_WITH_DEPENDENCY, null, 2)}\n`,
        'utf8',
      );

      const catalogRepository = new InMemoryPluginCatalogRepository();
      const tenantPluginRepository = new InMemoryTenantPluginRepository();

      const discovery = new DiscoveryService({
        catalogService: new CatalogService({
          validator: new ManifestValidator(),
          repository: catalogRepository,
        }),
      });

      await discovery.discoverFromDirectory(root);

      const installService = createInstallService({
        catalogRepository,
        tenantPluginRepository,
      });

      const result = await installService.install({
        tenantId: TENANT_ID,
        pluginId: PLUGIN_MANIFEST_WITH_DEPENDENCY.id,
        version: PLUGIN_MANIFEST_WITH_DEPENDENCY.version,
        tenantConfig: createTenantConfigWithPlugin({
          pluginId: PLUGIN_MANIFEST_WITH_DEPENDENCY.id,
          version: PLUGIN_MANIFEST_WITH_DEPENDENCY.version,
        }),
      });

      expect(result.resolvedDependencies).toEqual([
        {
          pluginId: VALID_PLUGIN_MANIFEST.id,
          requestedRange: '^1.0.0',
          resolvedVersion: '1.0.0',
        },
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('facade discovers, enables, dispatches, and disables with hook activation', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-facade-'));

    try {
      await writeFile(
        join(root, 'contrast.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST, null, 2)}\n`,
        'utf8',
      );

      const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
      const discovery = await registry.discoverFromDirectory(root);
      expect(discovery.registered).toBe(1);

      registry.registerHandler({
        pluginId: VALID_PLUGIN_MANIFEST.id,
        handlerId: 'extendPresets',
        handler: (invocation) => {
          const payload = invocation.context as { presets: string[] };
          payload.presets.push('contrast');
        },
      });
      registry.registerHandler({
        pluginId: VALID_PLUGIN_MANIFEST.id,
        handlerId: 'adjustResolvedTheme',
        handler: () => undefined,
      });

      const tenantConfig = createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      });

      await registry.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        settings: { contrastLevel: 'high' },
        tenantConfig,
      });

      await registry.enable({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        tenantConfig,
      });

      const payload = { presets: [] as string[] };
      const dispatched = await registry.dispatch({
        tenantId: TENANT_ID,
        hookPoint: 'theme.presets.extend',
        context: payload,
      });

      expect(dispatched.invoked).toBe(1);
      expect(payload.presets).toEqual(['contrast']);

      await registry.disable({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
      });

      const afterDisable = await registry.dispatch({
        tenantId: TENANT_ID,
        hookPoint: 'theme.presets.extend',
        context: { presets: [] },
      });
      expect(afterDisable.invoked).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not persist tenant bindings when ConfigProvider gate fails', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();

    await new CatalogService({
      validator: new ManifestValidator(),
      repository: catalogRepository,
    }).register(VALID_PLUGIN_MANIFEST);

    const installService = createInstallService({
      catalogRepository,
      tenantPluginRepository,
      configProvider: new ConfigProvider({ cache: false }),
    });

    await expect(
      installService.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        tenantConfig: {
          tenant: {
            id: TENANT_ID,
            slug: 'invalid',
            name: 'Invalid',
            vertical: 'grocery',
            status: 'active',
            defaultLocale: 'en',
            defaultTimezone: 'UTC',
          },
          integrations: {
            plugins: [
              {
                id: VALID_PLUGIN_MANIFEST.id,
                version: VALID_PLUGIN_MANIFEST.version,
                enabled: false,
                settings: { contrastLevel: 'high' },
              },
            ],
          },
        },
      }),
    ).rejects.toThrow();

    await expect(
      tenantPluginRepository.findByTenantAndPlugin(TENANT_ID, VALID_PLUGIN_MANIFEST.id),
    ).resolves.toBeUndefined();
  });
});
