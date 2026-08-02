import { describe, expect, it } from 'vitest';

import {
  ThemePluginRegistry,
  type ThemePluginContributor,
} from '../src/domain/plugin-extensions.js';
import { PresetRegistry } from '../src/domain/preset-registry.js';
import { ThemeResolver } from '../src/domain/theme-resolver.js';
import { PresetLoader } from '../src/infrastructure/preset-loader.js';

describe('ThemePluginRegistry', () => {
  it('registers and lists contributors', () => {
    const registry = new ThemePluginRegistry();
    const plugin: ThemePluginContributor = { id: 'test-plugin', version: '1.0.0' };

    registry.register(plugin);
    expect(registry.list()).toEqual(['test-plugin']);
    expect(registry.unregister('test-plugin')).toBe(true);
  });

  it('applies extendResolvedTheme transformations', () => {
    const pluginRegistry = new ThemePluginRegistry();
    pluginRegistry.register({
      id: 'color-shift',
      version: '1.0.0',
      extendResolvedTheme: (result) => ({
        ...result,
        theme: {
          ...result.theme,
          colors: { ...result.theme.colors, primary: '#PLUGIN' },
        },
      }),
    });

    const resolver = new ThemeResolver({ pluginRegistry });
    const result = resolver.resolve({ tenantTheme: { preset: 'modern' } });

    expect(result.theme.colors.primary).toBe('#PLUGIN');
  });

  it('applies extendPresets to preset registry', () => {
    const presetRegistry = new PresetRegistry();
    const pluginRegistry = new ThemePluginRegistry();

    pluginRegistry.register({
      id: 'preset-ext',
      version: '1.0.0',
      extendPresets: (registry) => {
        registry.register('minimal', {
          preset: 'minimal',
          colors: { primary: '#PLUGIN_PRESET' } as never,
        });
      },
    });

    pluginRegistry.applyPresetExtensions(presetRegistry);

    const loader = new PresetLoader(presetRegistry);
    expect(loader.load('minimal').colors?.primary).toBe('#PLUGIN_PRESET');
  });

  it('passes through unchanged when no plugins registered', () => {
    const registry = new ThemePluginRegistry();
    const resolver = new ThemeResolver({ pluginRegistry: registry });
    const result = resolver.resolve({ tenantTheme: { preset: 'modern' } });

    expect(result.theme.colors.primary).toBe('#16A34A');
  });
});
