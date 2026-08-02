import { describe, expect, it } from 'vitest';

import { ModeResolver } from '../src/domain/mode-resolver.js';
import { ThemeResolver } from '../src/domain/theme-resolver.js';

describe('ModeResolver', () => {
  const resolver = new ModeResolver();
  const themeResolver = new ThemeResolver();

  it('produces light tokens from base colors', () => {
    const { theme } = themeResolver.resolve({ tenantTheme: { preset: 'modern' } });
    const modes = resolver.resolve(theme);

    expect(modes.light.primary).toBe('#16A34A');
    expect(modes.light.background).toBe('#FFFFFF');
  });

  it('merges darkMode.colors overrides into dark palette', () => {
    const { theme } = themeResolver.resolve({
      tenantTheme: {
        preset: 'luxury',
      },
    });
    const modes = resolver.resolve(theme);

    expect(modes.dark.background).toBe('#1C1917');
    expect(modes.dark.text).toBe('#FAFAF9');
  });

  it('uses light palette for dark when darkMode is disabled', () => {
    const { theme } = themeResolver.resolve({
      tenantTheme: {
        preset: 'modern',
        darkMode: { enabled: false },
      },
    });
    const modes = resolver.resolve(theme);

    expect(modes.dark).toEqual(modes.light);
    expect(resolver.isDarkModeEnabled(theme)).toBe(false);
  });

  it('defaults strategy to system (auto)', () => {
    const { theme } = themeResolver.resolve({ tenantTheme: { preset: 'default' } });
    expect(resolver.getStrategy(theme)).toBe('system');
  });

  it('respects manual strategy on dark preset', () => {
    const { theme } = themeResolver.resolve({ tenantTheme: { preset: 'dark' } });
    expect(resolver.getStrategy(theme)).toBe('manual');
  });

  it('generates dark fallbacks for unspecified dark tokens', () => {
    const { theme } = themeResolver.resolve({
      tenantTheme: {
        preset: 'modern',
        darkMode: { enabled: true, colors: { primary: '#FF0000' } },
      },
    });
    const modes = resolver.resolve(theme);

    expect(modes.dark.primary).toBe('#FF0000');
    expect(modes.dark.background).toBe('#111827');
  });
});
