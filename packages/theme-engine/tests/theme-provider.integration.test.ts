import { ConfigProvider } from '@ai-commerce/config-runtime';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { themeConfigSourceFromProviderResult } from '../src/domain/map-config-theme-source.js';
import { createTestThemeProvider } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const FULL_EXAMPLE_PATH = join(REPO_ROOT, 'schemas/tenant-config/v1/examples/full.example.json');

describe('ThemeProvider integration', () => {
  const configProvider = new ConfigProvider({ cache: false });

  it('loads theme from ConfigProvider result without re-resolving config', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestThemeProvider();
    const result = provider.provideFromProviderResult(configResult);

    expect(result.resolved.theme.preset).toBe('modern');
    expect(result.resolved.theme.colors.primary).toBe('#16A34A');
    expect(result.artifacts.css.surface).toBe('css');
    expect(result.artifacts.tailwind.surface).toBe('tailwind');
    expect(result.fromCache).toBe(false);
  });

  it('compiles surface artifacts through ThemeCompiler', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestThemeProvider();
    const result = provider.provideFromProviderResult(configResult, {
      surfaces: ['css', 'react-native'],
    });

    expect(result.artifacts.css.variables['--color-primary']).toBe('#16A34A');
    expect(result.artifacts['react-native'].light.colors.primary).toBe('#16A34A');
    expect(result.artifacts.tailwind).toBeUndefined();
    expect(result.tokens.preset).toBe('modern');
  });

  it('returns cached compilations on repeated provide calls', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestThemeProvider({ cache: { maxEntries: 10 } });

    const first = provider.provideFromProviderResult(configResult);
    const second = provider.provideFromProviderResult(configResult);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(first.compiledAt).toBe(second.compiledAt);
    expect(second.resolved.metadata.hash).toBe(first.resolved.metadata.hash);
  });

  it('skips cache when skipCache is true', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestThemeProvider({ cache: { maxEntries: 10 } });

    provider.provideFromProviderResult(configResult);
    const second = provider.provideFromProviderResult(configResult, { skipCache: true });

    expect(second.fromCache).toBe(false);
  });

  it('produces distinct themes for multiple tenants', () => {
    const provider = createTestThemeProvider();

    const tenantA = provider.provide({
      tenantTheme: { preset: 'modern', colors: { primary: '#111111' } },
      surfaces: ['css'],
    });
    const tenantB = provider.provide({
      tenantTheme: { preset: 'modern', colors: { primary: '#222222' } },
      surfaces: ['css'],
    });

    expect(tenantA.resolved.metadata.hash).not.toBe(tenantB.resolved.metadata.hash);
    expect(tenantA.artifacts.css.variables['--color-primary']).toBe('#111111');
    expect(tenantB.artifacts.css.variables['--color-primary']).toBe('#222222');
  });

  it('compiles all built-in presets', () => {
    const provider = createTestThemeProvider();

    for (const preset of ['default', 'minimal', 'modern', 'luxury', 'dark'] as const) {
      const result = provider.provide({
        tenantTheme: { preset },
        surfaces: ['css'],
      });

      expect(result.resolved.theme.preset).toBe(preset);
      expect(result.artifacts.css.css).toContain('--color-primary');
    }
  });

  it('produces distinct light and dark palettes for dual-mode presets', () => {
    const provider = createTestThemeProvider();
    const result = provider.provide({
      tenantTheme: { preset: 'modern' },
      surfaces: ['css', 'react-native'],
    });

    expect(result.resolved.modes.light.background).not.toBe(result.resolved.modes.dark.background);
    expect(result.artifacts.css.variables['--color-background']).toBe(
      result.resolved.modes.light.background,
    );
    expect(result.artifacts.css.darkVariables['--color-background']).toBe(
      result.resolved.modes.dark.background,
    );
    expect(result.artifacts['react-native'].dark.colors.background).toBe(
      result.resolved.modes.dark.background,
    );
  });

  it('clearCache forces recompilation', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestThemeProvider({ cache: { maxEntries: 10 } });

    const first = provider.provideFromProviderResult(configResult);
    provider.clearCache();
    const second = provider.provideFromProviderResult(configResult);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(false);
    expect(first.compiledAt).not.toBe(second.compiledAt);
  });
});

describe('toResolveThemeInput integration', () => {
  it('maps ConfigProvider layers to theme resolver input', async () => {
    const configProvider = new ConfigProvider({ cache: false });
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestThemeProvider();

    const resolvedOnly = provider.resolve({
      tenantId: configResult.config.tenant?.id,
      environment: configResult.environment,
      vertical: configResult.vertical,
      tenantTheme: configResult.config.theme,
      environmentTheme: configResult.layers.environment?.theme as never,
    });

    const fromConfig = provider.provideFromConfig({
      source: themeConfigSourceFromProviderResult(configResult),
      surfaces: ['css'],
    });

    expect(fromConfig.resolved.metadata.hash).toBe(resolvedOnly.metadata.hash);
    expect(fromConfig.resolved.theme.colors.primary).toBe(resolvedOnly.theme.colors.primary);
  });
});
