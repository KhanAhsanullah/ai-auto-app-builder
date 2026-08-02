import { describe, expect, it } from 'vitest';

import { TokenNormalizer } from '../src/domain/token-normalizer.js';
import { ThemeResolver } from '../src/domain/theme-resolver.js';

describe('TokenNormalizer', () => {
  const resolver = new ThemeResolver();
  const normalizer = new TokenNormalizer();

  it('normalizes modern preset tokens from resolved theme', () => {
    const resolved = resolver.resolve({ tenantTheme: { preset: 'modern' } });
    const tokens = normalizer.normalize(resolved);

    expect(tokens.preset).toBe('modern');
    expect(tokens.modes.light.primary).toBe(resolved.modes.light.primary);
    expect(tokens.modes.dark.background).toBe(resolved.modes.dark.background);
    expect(tokens.metadata.hash).toBe(resolved.metadata.hash);
    expect(tokens.darkModeEnabled).toBe(true);
    expect(tokens.modeStrategy).toBe('system');
  });

  it('preserves resolved mode color values including merged defaults', () => {
    const resolved = resolver.resolve({
      tenantTheme: {
        preset: 'custom',
        colors: {
          primary: '#111111',
          secondary: '#222222',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          text: '#000000',
          error: '#FF0000',
          success: '#00AA00',
          warning: '#FFAA00',
        },
        typography: {
          fontFamily: { heading: 'Arial', body: 'Arial' },
          scale: 'default',
        },
        spacing: { unit: 4 },
        radius: { sm: 4, md: 8, lg: 12 },
      },
    });

    const tokens = normalizer.normalize(resolved);

    expect(tokens.modes.light.textMuted).toBe(resolved.modes.light.textMuted);
    expect(tokens.modes.light.border).toBe(resolved.modes.light.border);
  });

  it('derives spacing scale from unit and density', () => {
    const resolved = resolver.resolve({
      tenantTheme: {
        preset: 'minimal',
        spacing: { unit: 8, density: 'spacious' },
      },
    });

    const tokens = normalizer.normalize(resolved);

    expect(tokens.spacing.unit).toBe(8);
    expect(tokens.spacing.density).toBe('spacious');
    expect(tokens.spacing.scale.xs).toBe('16px');
    expect(tokens.spacing.scale['2xl']).toBe('112px');
  });

  it('derives typography scale from base font size and scale setting', () => {
    const resolved = resolver.resolve({
      tenantTheme: {
        preset: 'luxury',
        typography: {
          fontFamily: { heading: 'Playfair Display', body: 'Lato' },
          scale: 'comfortable',
          baseFontSize: 18,
        },
      },
    });

    const tokens = normalizer.normalize(resolved);

    expect(tokens.typography.fontFamilyHeading).toBe('Playfair Display');
    expect(tokens.typography.fontSize.base).toBe('18px');
    expect(tokens.typography.fontSize.lg).toBe('24.75px');
  });

  it('formats radius values as CSS pixel strings', () => {
    const resolved = resolver.resolve({ tenantTheme: { preset: 'default' } });
    const tokens = normalizer.normalize(resolved);

    expect(tokens.radius.sm).toBe('4px');
    expect(tokens.radius.md).toBe('8px');
    expect(tokens.radius.lg).toBe('12px');
    expect(tokens.radius.full).toBe('9999px');
  });

  it('preserves component variants and motion from resolved theme', () => {
    const resolved = resolver.resolve({ tenantTheme: { preset: 'modern' } });
    const tokens = normalizer.normalize(resolved);

    expect(tokens.componentVariants.button).toBe('filled');
    expect(tokens.componentVariants.input).toBe('outline');
    expect(tokens.componentVariants.card).toBe('elevated');
    expect(tokens.motion.enabled).toBe(true);
    expect(tokens.motion.durationMs).toBe(200);
  });

  it('produces distinct light and dark color modes for dual-mode presets', () => {
    const resolved = resolver.resolve({ tenantTheme: { preset: 'modern' } });
    const tokens = normalizer.normalize(resolved);

    expect(tokens.modes.light.background).not.toBe(tokens.modes.dark.background);
    expect(tokens.modes.dark.background).toBe(resolved.modes.dark.background);
  });
});
