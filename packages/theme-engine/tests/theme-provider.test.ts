import { describe, expect, it } from 'vitest';

import {
  themeConfigSourceFromProviderResult,
  toResolveThemeInput,
} from '../src/domain/map-config-theme-source.js';
import { createTestThemeProvider } from './helpers.js';

describe('ThemeProvider', () => {
  const provider = createTestThemeProvider();

  it('resolve returns resolved theme without compiling artifacts', () => {
    const resolved = provider.resolve({ tenantTheme: { preset: 'modern' } });

    expect(resolved.theme.preset).toBe('modern');
    expect(resolved.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('provide returns resolved theme and compiled artifacts', () => {
    const result = provider.provide({
      tenantTheme: { preset: 'minimal' },
      surfaces: ['css'],
    });

    expect(result.resolved.theme.preset).toBe('minimal');
    expect(result.artifacts.css.surface).toBe('css');
    expect(result.fromCache).toBe(false);
  });

  it('provideFromConfig accepts normalized ThemeConfigSource', () => {
    const result = provider.provideFromConfig({
      source: themeConfigSourceFromProviderResult({
        config: {
          theme: { preset: 'luxury' } as never,
          tenant: { id: 'tenant-1' } as never,
        },
        layers: {},
        environment: 'production',
        vertical: 'fashion',
      }),
      surfaces: ['tailwind'],
    });

    expect(result.resolved.theme.preset).toBe('luxury');
    expect(result.artifacts.tailwind.surface).toBe('tailwind');
  });

  it('maps config source fields through toResolveThemeInput', () => {
    const input = toResolveThemeInput(
      themeConfigSourceFromProviderResult({
        config: {
          theme: { preset: 'dark' } as never,
          tenant: { id: 'abc-123' } as never,
        },
        layers: {
          environment: { theme: { colors: { primary: '#FF0000' } } },
        },
        environment: 'staging',
        vertical: 'grocery',
      }),
    );

    expect(input.tenantId).toBe('abc-123');
    expect(input.environment).toBe('staging');
    expect(input.vertical).toBe('grocery');
    expect(input.tenantTheme?.preset).toBe('dark');
    expect(input.environmentTheme?.colors?.primary).toBe('#FF0000');
  });

  it('getCachedCompiled retrieves cached artifacts by hash', () => {
    const cachedProvider = createTestThemeProvider({ cache: { maxEntries: 10 } });
    const result = cachedProvider.provide({
      tenantTheme: { preset: 'modern' },
      surfaces: ['css'],
    });

    const cached = cachedProvider.getCachedCompiled(result.metadata.hash, ['css']);

    expect(cached).toBeDefined();
    expect(cached?.artifacts.css.css).toBe(result.artifacts.css.css);
  });
});
