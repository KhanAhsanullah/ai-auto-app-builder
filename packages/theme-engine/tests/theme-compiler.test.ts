import { describe, expect, it } from 'vitest';

import { createThemeCompiler } from './helpers.js';

describe('ThemeCompiler', () => {
  const compiler = createThemeCompiler();

  it('compiles all surfaces from resolver input', () => {
    const result = compiler.compile({ tenantTheme: { preset: 'modern' } });

    expect(result.tokens.preset).toBe('modern');
    expect(result.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.artifacts.css.surface).toBe('css');
    expect(result.artifacts.tailwind.surface).toBe('tailwind');
    expect(result.artifacts['react-native'].surface).toBe('react-native');
    expect(result.artifacts['admin-dashboard'].surface).toBe('admin-dashboard');
    expect(result.compiledAt).toBeDefined();
  });

  it('compiles selected surfaces only', () => {
    const result = compiler.compile({
      tenantTheme: { preset: 'minimal' },
      surfaces: ['css', 'tailwind'],
    });

    expect(result.artifacts.css).toBeDefined();
    expect(result.artifacts.tailwind).toBeDefined();
    expect(result.artifacts['react-native']).toBeUndefined();
    expect(result.artifacts['admin-dashboard']).toBeUndefined();
  });

  it('compileFromResolved matches compile output', () => {
    const resolver = compiler.getResolver();
    const resolved = resolver.resolve({ tenantTheme: { preset: 'luxury' } });

    const direct = compiler.compileFromResolved({ resolved });
    const viaConfig = compiler.compile({ tenantTheme: { preset: 'luxury' } });

    expect(direct.tokens).toEqual(viaConfig.tokens);
    expect(direct.artifacts.css.css).toBe(viaConfig.artifacts.css.css);
  });

  it('uses cache for repeated compilations with same hash', () => {
    const cachedCompiler = createThemeCompiler({ cache: { maxEntries: 10 } });
    const input = { tenantTheme: { preset: 'modern' as const } };

    const first = cachedCompiler.compile(input);
    const second = cachedCompiler.compile(input);

    expect(first).toBe(second);
    expect(cachedCompiler.getCached(first.metadata.hash)).toEqual(first);
  });

  it('produces different cache entries for different surface selections', () => {
    const cachedCompiler = createThemeCompiler({ cache: {} });
    const resolved = compiler.getResolver().resolve({ tenantTheme: { preset: 'modern' } });

    const allSurfaces = cachedCompiler.compileFromResolved({ resolved });
    const cssOnly = cachedCompiler.compileFromResolved({ resolved, surfaces: ['css'] });

    expect(allSurfaces).not.toBe(cssOnly);
    expect(cssOnly.artifacts.css).toBeDefined();
    expect(cssOnly.artifacts.tailwind).toBeUndefined();
  });

  it('reflects tenant color overrides in compiled artifacts', () => {
    const result = compiler.compile({
      tenantTheme: {
        preset: 'modern',
        colors: { primary: '#AABBCC' },
      },
      surfaces: ['css'],
    });

    expect(result.artifacts.css.variables['--color-primary']).toBe('#AABBCC');
    expect(result.artifacts.css.css).toContain('--color-primary: #AABBCC;');
  });

  it('clearCache removes cached compilations', () => {
    const cachedCompiler = createThemeCompiler({ cache: {} });
    const result = cachedCompiler.compile({ tenantTheme: { preset: 'dark' } });

    expect(cachedCompiler.getCached(result.metadata.hash)).toBeDefined();

    cachedCompiler.clearCache();

    expect(cachedCompiler.getCached(result.metadata.hash)).toBeUndefined();
  });
});
