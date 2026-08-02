import { describe, expect, it } from 'vitest';

import { ThemeResolver } from '../src/domain/theme-resolver.js';
import { IncompleteCustomThemeException, ThemeResolutionException } from '../src/errors.js';
import { CUSTOM_THEME_FIXTURE } from './helpers.js';

describe('ThemeResolver', () => {
  const resolver = new ThemeResolver();

  it('resolves modern preset by default', () => {
    const result = resolver.resolve({ tenantTheme: { preset: 'modern' } });

    expect(result.theme.preset).toBe('modern');
    expect(result.theme.colors.primary).toBe('#16A34A');
    expect(result.darkModeEnabled).toBe(true);
    expect(result.modeStrategy).toBe('system');
  });

  it('applies vertical preset for grocery', () => {
    const result = resolver.resolve({
      vertical: 'grocery',
      tenantTheme: { preset: 'modern' },
    });

    expect(result.theme.colors.primary).toBe('#16A34A');
    expect(result.layers.vertical.preset).toBe('modern');
  });

  it('allows tenant to override preset colors', () => {
    const result = resolver.resolve({
      tenantTheme: {
        preset: 'modern',
        colors: { primary: '#FF0000' },
      },
    });

    expect(result.theme.colors.primary).toBe('#FF0000');
    expect(result.theme.colors.secondary).toBe('#F59E0B');
  });

  it('resolves all built-in presets', () => {
    for (const preset of ['default', 'minimal', 'modern', 'luxury', 'dark'] as const) {
      const result = resolver.resolve({ tenantTheme: { preset } });
      expect(result.theme.preset).toBe(preset);
      expect(result.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('populates theme metadata on resolve', () => {
    const result = resolver.resolve({
      tenantTheme: {
        preset: 'modern',
        metadata: {
          themeVersion: 3,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
      },
    });

    expect(result.metadata.themeVersion).toBe(3);
    expect(result.metadata.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.metadata.updatedAt).toBe('2026-02-01T00:00:00.000Z');
    expect(result.metadata.compiledAt).toBeDefined();
    expect(result.metadata.hash).toHaveLength(64);
    expect(result.theme.metadata?.hash).toBe(result.metadata.hash);
  });

  it('requires complete theme for custom preset', () => {
    expect(() =>
      resolver.resolve({
        tenantTheme: { preset: 'custom', colors: { primary: '#000' } },
      }),
    ).toThrow(IncompleteCustomThemeException);
  });

  it('accepts valid custom preset', () => {
    const result = resolver.resolve({ tenantTheme: CUSTOM_THEME_FIXTURE });
    expect(result.theme.preset).toBe('custom');
    expect(result.theme.colors.primary).toBe('#000000');
  });

  it('applies environment theme overrides', () => {
    const result = resolver.resolve({
      tenantTheme: { preset: 'modern' },
      environmentTheme: {
        colors: { primary: '#0000FF' },
      },
    });

    expect(result.theme.colors.primary).toBe('#0000FF');
    expect(result.layers.environment).toEqual({
      colors: { primary: '#0000FF' },
    });
  });

  it('throws for unknown preset', () => {
    expect(() =>
      resolver.resolve({
        tenantTheme: { preset: 'nonexistent' as 'modern' },
      }),
    ).toThrow(ThemeResolutionException);
  });

  it('produces deterministic hash for identical input', () => {
    const input = { tenantTheme: { preset: 'modern' as const } };
    const first = resolver.resolve(input);
    const second = resolver.resolve(input);

    expect(first.metadata.hash).toBe(second.metadata.hash);
  });

  it('changes hash when tenant overrides change', () => {
    const base = resolver.resolve({ tenantTheme: { preset: 'modern' } });
    const overridden = resolver.resolve({
      tenantTheme: { preset: 'modern', colors: { primary: '#FF0000' } },
    });

    expect(base.metadata.hash).not.toBe(overridden.metadata.hash);
  });
});
