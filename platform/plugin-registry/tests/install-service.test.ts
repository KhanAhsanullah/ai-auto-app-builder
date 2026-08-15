import { ConfigProvider, ConfigValidationException } from '@ai-commerce/config-runtime';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import { InMemoryTenantPluginRepository } from '../src/infrastructure/in-memory-tenant-plugin-repository.js';
import {
  PluginCatalogNotFoundException,
  PluginDependencyUnresolvedException,
  PluginSettingsConflictException,
  PluginSettingsValidationException,
  TenantPluginAlreadyInstalledException,
  TenantPluginConfigMismatchException,
} from '../src/errors.js';
import {
  createInstallService,
  createTenantConfigWithPlugin,
  PLUGIN_MANIFEST_NO_CONFIG_SCHEMA,
  PLUGIN_MANIFEST_WITH_DEPENDENCY,
  TENANT_ID,
  VALID_PLUGIN_MANIFEST,
  seedCatalog,
} from './helpers.js';

describe('InstallService', () => {
  it('installs a plugin successfully with installed status', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({ catalogRepository, tenantPluginRepository });
    const tenantConfig = createTenantConfigWithPlugin({
      settings: { contrastLevel: 'high' },
    });

    const result = await service.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'high' },
      tenantConfig,
    });

    expect(result.created).toBe(true);
    expect(result.status).toBe('installed');
    expect(result.installFingerprint).toHaveLength(64);

    const stored = await tenantPluginRepository.findByTenantAndPlugin(
      TENANT_ID,
      VALID_PLUGIN_MANIFEST.id,
    );
    expect(stored?.status).toBe('installed');
  });

  it('returns idempotent success for identical install replay', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({ catalogRepository, tenantPluginRepository });
    const tenantConfig = createTenantConfigWithPlugin({
      settings: { contrastLevel: 'normal' },
    });
    const input = {
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig,
    };

    const first = await service.install(input);
    const second = await service.install(input);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.installFingerprint).toBe(first.installFingerprint);
  });

  it('throws when catalog plugin version is missing', async () => {
    const service = createInstallService({
      catalogRepository: new InMemoryPluginCatalogRepository(),
      tenantPluginRepository: new InMemoryTenantPluginRepository(),
    });

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        tenantConfig: createTenantConfigWithPlugin(),
      }),
    ).rejects.toThrow(PluginCatalogNotFoundException);
  });

  it('throws when tenant config declaration does not match install request', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({
      catalogRepository,
      tenantPluginRepository: new InMemoryTenantPluginRepository(),
    });

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        tenantConfig: createTenantConfigWithPlugin({
          version: '2.0.0',
        }),
      }),
    ).rejects.toThrow(TenantPluginConfigMismatchException);
  });

  it('throws when install settings conflict with tenant config settings', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({
      catalogRepository,
      tenantPluginRepository: new InMemoryTenantPluginRepository(),
    });

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        settings: { contrastLevel: 'high' },
        tenantConfig: createTenantConfigWithPlugin({
          settings: { contrastLevel: 'normal' },
        }),
      }),
    ).rejects.toThrow(PluginSettingsConflictException);
  });

  it('throws when settings fail configSchema validation', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({
      catalogRepository,
      tenantPluginRepository: new InMemoryTenantPluginRepository(),
    });

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        settings: { contrastLevel: 'invalid' },
        tenantConfig: createTenantConfigWithPlugin({
          settings: { contrastLevel: 'invalid' },
        }),
      }),
    ).rejects.toThrow(PluginSettingsValidationException);
  });

  it('throws when dependencies cannot be resolved', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    await seedCatalog(catalogRepository, [PLUGIN_MANIFEST_WITH_DEPENDENCY]);

    const service = createInstallService({
      catalogRepository,
      tenantPluginRepository: new InMemoryTenantPluginRepository(),
    });

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: PLUGIN_MANIFEST_WITH_DEPENDENCY.id,
        version: PLUGIN_MANIFEST_WITH_DEPENDENCY.version,
        tenantConfig: createTenantConfigWithPlugin({
          pluginId: PLUGIN_MANIFEST_WITH_DEPENDENCY.id,
          version: PLUGIN_MANIFEST_WITH_DEPENDENCY.version,
        }),
      }),
    ).rejects.toThrow(PluginDependencyUnresolvedException);
  });

  it('throws when the same tenant plugin is installed with different content', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({ catalogRepository, tenantPluginRepository });

    await service.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'high' },
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
        settings: { contrastLevel: 'normal' },
        tenantConfig: createTenantConfigWithPlugin({
          settings: { contrastLevel: 'normal' },
        }),
      }),
    ).rejects.toThrow(TenantPluginAlreadyInstalledException);
  });

  it('throws when ConfigProvider validation gate fails', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    await seedCatalog(catalogRepository, [PLUGIN_MANIFEST_NO_CONFIG_SCHEMA]);

    const service = createInstallService({
      catalogRepository,
      tenantPluginRepository: new InMemoryTenantPluginRepository(),
      configProvider: new ConfigProvider({ cache: false }),
    });

    const invalidTenantConfig = {
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
            id: PLUGIN_MANIFEST_NO_CONFIG_SCHEMA.id,
            version: PLUGIN_MANIFEST_NO_CONFIG_SCHEMA.version,
            enabled: false,
          },
        ],
      },
    } satisfies ConfigLayer;

    await expect(
      service.install({
        tenantId: TENANT_ID,
        pluginId: PLUGIN_MANIFEST_NO_CONFIG_SCHEMA.id,
        version: PLUGIN_MANIFEST_NO_CONFIG_SCHEMA.version,
        tenantConfig: invalidTenantConfig,
      }),
    ).rejects.toThrow(ConfigValidationException);
  });

  it('uses config-declared settings when install input omits settings', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();
    await seedCatalog(catalogRepository);

    const service = createInstallService({ catalogRepository, tenantPluginRepository });

    await service.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    const stored = await tenantPluginRepository.findByTenantAndPlugin(
      TENANT_ID,
      VALID_PLUGIN_MANIFEST.id,
    );

    expect(stored?.settings).toEqual({ contrastLevel: 'high' });
  });
});
