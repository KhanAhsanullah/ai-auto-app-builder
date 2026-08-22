import { describe, expect, it } from 'vitest';

import { createPluginRegistry } from '../src/infrastructure/create-plugin-registry.js';
import { PluginHandlerNotRegisteredException } from '../src/errors.js';
import {
  createTenantConfigWithPlugin,
  FIXED_CLOCK,
  TENANT_ID,
  VALID_PLUGIN_MANIFEST,
} from './helpers.js';

function defaultTenantConfig() {
  return createTenantConfigWithPlugin({
    settings: { contrastLevel: 'normal' },
  });
}

function registerContrastHandlers(
  registry: ReturnType<typeof createPluginRegistry>,
  onResolve?: (value: { contrast: string }) => void,
) {
  registry.registerHandler({
    pluginId: VALID_PLUGIN_MANIFEST.id,
    handlerId: 'extendPresets',
    handler: () => undefined,
  });
  registry.registerHandler({
    pluginId: VALID_PLUGIN_MANIFEST.id,
    handlerId: 'adjustResolvedTheme',
    handler: (invocation) => {
      onResolve?.(invocation.context as { contrast: string });
    },
  });
}

describe('PluginRegistry facade', () => {
  it('installs without activating handlers', async () => {
    const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
    await registry.registerManifest(VALID_PLUGIN_MANIFEST);
    registerContrastHandlers(registry);

    const tenantConfig = defaultTenantConfig();
    await registry.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig,
    });

    const result = await registry.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.resolve.after',
      context: { contrast: 'normal' },
    });

    expect(result.invoked).toBe(0);
  });

  it('fails enable when handlers are not registered', async () => {
    const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
    await registry.registerManifest(VALID_PLUGIN_MANIFEST);

    const tenantConfig = defaultTenantConfig();
    await registry.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig,
    });

    await expect(
      registry.enable({
        tenantId: TENANT_ID,
        pluginId: VALID_PLUGIN_MANIFEST.id,
        tenantConfig,
      }),
    ).rejects.toThrow(PluginHandlerNotRegisteredException);

    const binding = await registry.findTenantBinding(TENANT_ID, VALID_PLUGIN_MANIFEST.id);
    expect(binding?.status).toBe('installed');
  });

  it('enables, dispatches, disables, and stops dispatch', async () => {
    const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
    await registry.registerManifest(VALID_PLUGIN_MANIFEST);

    const seen: string[] = [];
    registerContrastHandlers(registry, (ctx) => {
      seen.push(ctx.contrast);
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

    const enabled = await registry.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig,
    });
    expect(enabled.status).toBe('enabled');
    expect(enabled.changed).toBe(true);

    await registry.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.resolve.after',
      context: { contrast: 'high' },
    });
    expect(seen).toEqual(['high']);

    await registry.disable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
    });

    const afterDisable = await registry.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.resolve.after',
      context: { contrast: 'high' },
    });
    expect(afterDisable.invoked).toBe(0);
  });

  it('enable is idempotent and heals missing activations', async () => {
    const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
    await registry.registerManifest(VALID_PLUGIN_MANIFEST);
    registerContrastHandlers(registry);

    const tenantConfig = defaultTenantConfig();
    await registry.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig,
    });

    await registry.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig,
    });

    const again = await registry.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig,
    });

    expect(again.changed).toBe(false);
    expect(again.status).toBe('enabled');

    const result = await registry.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.presets.extend',
      context: {},
    });
    expect(result.invoked).toBe(1);
  });

  it('uninstall removes binding and activations', async () => {
    const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
    await registry.registerManifest(VALID_PLUGIN_MANIFEST);
    registerContrastHandlers(registry);

    const tenantConfig = defaultTenantConfig();
    await registry.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig,
    });
    await registry.enable({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      tenantConfig,
    });

    await registry.uninstall({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
    });

    await expect(
      registry.findTenantBinding(TENANT_ID, VALID_PLUGIN_MANIFEST.id),
    ).resolves.toBeUndefined();

    const result = await registry.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.resolve.after',
      context: {},
    });
    expect(result.invoked).toBe(0);
  });

  it('lists tenant bindings through the facade', async () => {
    const registry = createPluginRegistry({ clock: () => FIXED_CLOCK });
    await registry.registerManifest(VALID_PLUGIN_MANIFEST);

    await registry.install({
      tenantId: TENANT_ID,
      pluginId: VALID_PLUGIN_MANIFEST.id,
      version: VALID_PLUGIN_MANIFEST.version,
      settings: { contrastLevel: 'normal' },
      tenantConfig: defaultTenantConfig(),
    });

    const bindings = await registry.listTenantBindings(TENANT_ID);
    expect(bindings).toHaveLength(1);
    expect(bindings[0]?.pluginId).toBe(VALID_PLUGIN_MANIFEST.id);
  });
});
