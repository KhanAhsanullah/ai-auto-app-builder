import { describe, expect, it } from 'vitest';

import { PluginActivationService } from '../src/domain/plugin-activation-service.js';
import { PluginHandlerRegistry } from '../src/domain/plugin-handler-registry.js';
import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import { InMemoryTenantHandlerActivationStore } from '../src/infrastructure/in-memory-tenant-handler-activation-store.js';
import { InMemoryTenantPluginRepository } from '../src/infrastructure/in-memory-tenant-plugin-repository.js';
import { PluginHandlerNotRegisteredException } from '../src/errors.js';
import {
  createInstallService,
  createTenantConfigWithPlugin,
  FIXED_CLOCK,
  seedCatalog,
  TENANT_ID,
  VALID_PLUGIN_MANIFEST,
} from './helpers.js';

describe('PluginActivationService', () => {
  async function setup() {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();
    const activationStore = new InMemoryTenantHandlerActivationStore();
    const handlerRegistry = new PluginHandlerRegistry();

    await seedCatalog(catalogRepository);

    const installService = createInstallService({
      catalogRepository,
      tenantPluginRepository,
    });

    await installService.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig: createTenantConfigWithPlugin({
        settings: { contrastLevel: 'normal' },
      }),
    });

    const activationService = new PluginActivationService({
      catalogRepository,
      tenantPluginRepository,
      handlerRegistry,
      activationStore,
    });

    return {
      activationService,
      activationStore,
      handlerRegistry,
      tenantPluginRepository,
    };
  }

  it('blocks activation when a manifest handler is not registered', async () => {
    const { activationService } = await setup();

    await expect(
      activationService.assertHandlersRegistered({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        version: VALID_PLUGIN_MANIFEST.version,
      }),
    ).rejects.toThrow(PluginHandlerNotRegisteredException);
  });

  it('activates all manifest hooks after handlers are registered', async () => {
    const { activationService, activationStore, handlerRegistry } = await setup();

    handlerRegistry.register({
      pluginId: VALID_PLUGIN_MANIFEST.id,
      handlerId: 'extendPresets',
      handler: () => undefined,
    });
    handlerRegistry.register({
      pluginId: VALID_PLUGIN_MANIFEST.id,
      handlerId: 'adjustResolvedTheme',
      handler: () => undefined,
    });

    await activationService.activate({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
    });

    const activations = await activationStore.listByTenantAndPlugin(
      TENANT_ID,
      VALID_PLUGIN_MANIFEST.id,
    );

    expect(activations).toHaveLength(2);
    expect(activations.map((entry) => entry.handlerId).sort()).toEqual([
      'adjustResolvedTheme',
      'extendPresets',
    ]);
    expect(activations.find((entry) => entry.handlerId === 'extendPresets')?.priority).toBe(100);
  });

  it('deactivates removes tenant activations while leaving global handlers', async () => {
    const { activationService, activationStore, handlerRegistry } = await setup();

    handlerRegistry.register({
      pluginId: VALID_PLUGIN_MANIFEST.id,
      handlerId: 'extendPresets',
      handler: () => undefined,
    });
    handlerRegistry.register({
      pluginId: VALID_PLUGIN_MANIFEST.id,
      handlerId: 'adjustResolvedTheme',
      handler: () => undefined,
    });

    await activationService.activate({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
    });

    await activationService.deactivate(TENANT_ID, VALID_PLUGIN_MANIFEST.id);

    await expect(
      activationStore.listByTenantAndPlugin(TENANT_ID, VALID_PLUGIN_MANIFEST.id),
    ).resolves.toEqual([]);
    expect(handlerRegistry.has(VALID_PLUGIN_MANIFEST.id, 'extendPresets')).toBe(true);
  });

  it('replaceForPlugin is idempotent for the same activation set', async () => {
    const { activationService, activationStore, handlerRegistry } = await setup();

    handlerRegistry.register({
      pluginId: VALID_PLUGIN_MANIFEST.id,
      handlerId: 'extendPresets',
      handler: () => undefined,
    });
    handlerRegistry.register({
      pluginId: VALID_PLUGIN_MANIFEST.id,
      handlerId: 'adjustResolvedTheme',
      handler: () => undefined,
    });

    const target = {
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
    };

    await activationService.activate(target);
    await activationService.activate(target);

    const activations = await activationStore.listByTenantAndHook(
      TENANT_ID,
      'theme.presets.extend',
    );
    expect(activations).toHaveLength(1);
    expect(activations[0]?.pluginId).toBe(VALID_PLUGIN_MANIFEST.id);
  });

  it('uses default priority when manifest omits priority', async () => {
    const catalogRepository = new InMemoryPluginCatalogRepository();
    const tenantPluginRepository = new InMemoryTenantPluginRepository();
    const activationStore = new InMemoryTenantHandlerActivationStore();
    const handlerRegistry = new PluginHandlerRegistry();

    await catalogRepository.save({
      pluginId: 'com.commerceos.simple.plugin',
      version: '1.0.0',
      manifest: {
        id: 'com.commerceos.simple.plugin',
        name: 'Simple',
        description: 'Simple plugin',
        version: '1.0.0',
        engineVersion: '^5.0.0',
        permissions: [],
        hooks: [{ point: 'config.validate.after', handler: 'onValidate' }],
      },
      registeredAt: FIXED_CLOCK,
    });

    await tenantPluginRepository.save({
      tenantId: TENANT_ID,
      pluginId: 'com.commerceos.simple.plugin',
      version: '1.0.0',
      status: 'installed',
      resolvedDependencies: [],
      installFingerprint: 'fp',
      installedAt: FIXED_CLOCK,
      updatedAt: FIXED_CLOCK,
    });

    handlerRegistry.register({
      pluginId: 'com.commerceos.simple.plugin',
      handlerId: 'onValidate',
      handler: () => undefined,
    });

    const activationService = new PluginActivationService({
      catalogRepository,
      tenantPluginRepository,
      handlerRegistry,
      activationStore,
    });

    await activationService.activate({
      tenantId: TENANT_ID,
      pluginId: 'com.commerceos.simple.plugin',
      version: '1.0.0',
    });

    const [entry] = await activationStore.listByTenantAndHook(TENANT_ID, 'config.validate.after');
    expect(entry?.priority).toBe(100);
  });
});
