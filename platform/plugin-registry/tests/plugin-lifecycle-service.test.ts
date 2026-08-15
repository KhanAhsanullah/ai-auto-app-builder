import { ConfigValidationException } from '@ai-commerce/config-runtime';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import type { EnablePluginLifecycleInput } from '../src/domain/plugin-lifecycle-service.js';
import { InMemoryTenantPluginRepository } from '../src/infrastructure/in-memory-tenant-plugin-repository.js';
import {
  InvalidPluginLifecycleTransitionException,
  PluginNotInstalledException,
  PluginRegistryException,
} from '../src/errors.js';
import {
  createInstallService,
  createLifecycleService,
  createTenantConfigWithPlugin,
  TENANT_ID,
  VALID_PLUGIN_MANIFEST,
  seedCatalog,
} from './helpers.js';
import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';

async function seedInstalledBinding() {
  const catalogRepository = new InMemoryPluginCatalogRepository();
  const tenantPluginRepository = new InMemoryTenantPluginRepository();
  await seedCatalog(catalogRepository);

  const installService = createInstallService({ catalogRepository, tenantPluginRepository });
  await installService.install({
    tenantId: TENANT_ID,
    pluginId: VALID_PLUGIN_MANIFEST.id,
    version: VALID_PLUGIN_MANIFEST.version,
    settings: { contrastLevel: 'high' },
    tenantConfig: createTenantConfigWithPlugin({
      settings: { contrastLevel: 'high' },
    }),
  });

  return { catalogRepository, tenantPluginRepository };
}

describe('PluginLifecycleService', () => {
  it('throws when enable is called without tenantConfig', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    await expect(
      lifecycle.enable({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
      } as EnablePluginLifecycleInput),
    ).rejects.toThrow(PluginRegistryException);
  });

  it('throws when enable is called with invalid tenantConfig', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

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
            id: VALID_PLUGIN_MANIFEST.id,
            version: VALID_PLUGIN_MANIFEST.version,
            enabled: false,
            settings: { contrastLevel: 'high' },
          },
        ],
      },
    } satisfies ConfigLayer;

    await expect(
      lifecycle.enable({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        tenantConfig: invalidTenantConfig,
      }),
    ).rejects.toThrow(ConfigValidationException);
  });

  it('enables an installed plugin binding with valid tenantConfig', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    const result = await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    expect(result.changed).toBe(true);
    expect(result.status).toBe('enabled');
  });

  it('returns idempotent success when enabling an already enabled plugin', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    const second = await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    expect(second.changed).toBe(false);
    expect(second.status).toBe('enabled');
  });

  it('disables an enabled plugin binding', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    const result = await lifecycle.disable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
    });

    expect(result.changed).toBe(true);
    expect(result.status).toBe('disabled');
  });

  it('returns idempotent success when disabling an already disabled plugin', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });
    await lifecycle.disable({ tenantId: TENANT_ID, pluginId: VALID_PLUGIN_MANIFEST.id });

    const second = await lifecycle.disable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
    });

    expect(second.changed).toBe(false);
    expect(second.status).toBe('disabled');
  });

  it('rejects disable from installed status', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    await expect(
      lifecycle.disable({ tenantId: TENANT_ID, pluginId: VALID_PLUGIN_MANIFEST.id }),
    ).rejects.toThrow(InvalidPluginLifecycleTransitionException);
  });

  it('re-enables a disabled plugin binding', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });
    await lifecycle.disable({ tenantId: TENANT_ID, pluginId: VALID_PLUGIN_MANIFEST.id });

    const result = await lifecycle.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'high' },
      }),
    });

    expect(result.changed).toBe(true);
    expect(result.status).toBe('enabled');
  });

  it('uninstalls an existing plugin binding', async () => {
    const { tenantPluginRepository } = await seedInstalledBinding();
    const lifecycle = createLifecycleService(tenantPluginRepository);

    const result = await lifecycle.uninstall({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
    });

    expect(result.changed).toBe(true);
    await expect(
      tenantPluginRepository.findByTenantAndPlugin(TENANT_ID, VALID_PLUGIN_MANIFEST.id),
    ).resolves.toBeUndefined();
  });

  it('throws when uninstalling a missing plugin binding', async () => {
    const lifecycle = createLifecycleService(new InMemoryTenantPluginRepository());

    await expect(
      lifecycle.uninstall({ tenantId: TENANT_ID, pluginId: VALID_PLUGIN_MANIFEST.id }),
    ).rejects.toThrow(PluginNotInstalledException);
  });
});
