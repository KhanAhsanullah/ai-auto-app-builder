import { describe, expect, it } from 'vitest';

import { TokenNormalizer } from '../src/domain/token-normalizer.js';
import { ThemeResolver } from '../src/domain/theme-resolver.js';
import { AdminDashboardTokenEmitter } from '../src/infrastructure/emitters/admin-dashboard-emitter.js';
import { CssVariablesEmitter } from '../src/infrastructure/emitters/css-variables-emitter.js';
import { ReactNativeEmitter } from '../src/infrastructure/emitters/react-native-emitter.js';
import { TailwindEmitter } from '../src/infrastructure/emitters/tailwind-emitter.js';

function modernTokens() {
  const resolved = new ThemeResolver().resolve({ tenantTheme: { preset: 'modern' } });
  return new TokenNormalizer().normalize(resolved);
}

describe('CssVariablesEmitter', () => {
  const emitter = new CssVariablesEmitter();

  it('emits CSS variables for light and dark modes', () => {
    const output = emitter.emit(modernTokens());

    expect(output.surface).toBe('css');
    expect(output.variables['--color-primary']).toBeDefined();
    expect(output.darkVariables['--color-background']).toBeDefined();
    expect(output.css).toContain(':root {');
    expect(output.css).toContain('[data-theme="dark"] {');
    expect(output.css).toContain('@media (prefers-color-scheme: dark)');
  });

  it('matches snapshot for modern preset CSS output', () => {
    const output = emitter.emit(modernTokens());
    expect(output.css).toMatchSnapshot();
  });
});

describe('TailwindEmitter', () => {
  const emitter = new TailwindEmitter();

  it('emits Tailwind theme extension using CSS variable references', () => {
    const output = emitter.emit(modernTokens());

    expect(output.surface).toBe('tailwind');
    expect(output.config.theme.extend.colors.primary).toBe('var(--color-primary)');
    expect(output.config.theme.extend.fontFamily.heading).toContain('Inter');
    expect(output.config.darkMode).toBe('media');
  });

  it('uses class dark mode for manual strategy', () => {
    const resolved = new ThemeResolver().resolve({
      tenantTheme: {
        preset: 'modern',
        darkMode: { strategy: 'manual' },
      },
    });
    const tokens = new TokenNormalizer().normalize(resolved);
    const output = emitter.emit(tokens);

    expect(output.config.darkMode).toEqual(['class', '[data-theme="dark"]']);
  });

  it('uses class selector dark mode for scheduled strategy', () => {
    const resolved = new ThemeResolver().resolve({
      tenantTheme: {
        preset: 'modern',
        darkMode: { strategy: 'scheduled' },
      },
    });
    const tokens = new TokenNormalizer().normalize(resolved);
    const output = emitter.emit(tokens);

    expect(output.config.darkMode).toEqual(['class', '[data-theme="dark"]']);
  });

  it('matches snapshot for modern preset Tailwind config', () => {
    const output = emitter.emit(modernTokens());
    expect(output.config).toMatchSnapshot();
  });
});

describe('ReactNativeEmitter', () => {
  const emitter = new ReactNativeEmitter();

  it('emits separate light and dark mode theme objects', () => {
    const output = emitter.emit(modernTokens());

    expect(output.surface).toBe('react-native');
    expect(output.light.colors.primary).toBeDefined();
    expect(output.dark.colors.background).toBeDefined();
    expect(output.light.spacing.scale.md).toBeDefined();
    expect(output.darkModeEnabled).toBe(true);
    expect(output.modeStrategy).toBe('system');
  });

  it('matches snapshot for modern preset React Native theme', () => {
    const output = emitter.emit(modernTokens());
    expect(output).toMatchSnapshot();
  });
});

describe('AdminDashboardTokenEmitter', () => {
  const emitter = new AdminDashboardTokenEmitter();

  it('emits admin semantic tokens and CSS variables', () => {
    const output = emitter.emit(modernTokens());

    expect(output.surface).toBe('admin-dashboard');
    expect(output.variables['--admin-sidebar-bg']).toBeDefined();
    expect(output.semantic.light.navigation.active).toBe(output.semantic.light.actions.primary);
    expect(output.semantic.dark.layout.background).toBeDefined();
    expect(output.css).toContain('--admin-sidebar-bg');
  });

  it('matches snapshot for modern preset admin dashboard tokens', () => {
    const output = emitter.emit(modernTokens());
    expect({
      css: output.css,
      semantic: output.semantic,
    }).toMatchSnapshot();
  });
});

describe('Emitter light/dark parity', () => {
  it('uses identical shared tokens for light and dark CSS variable blocks', () => {
    const tokens = modernTokens();
    const css = new CssVariablesEmitter().emit(tokens);

    expect(css.variables['--font-family-heading']).toBe(css.darkVariables['--font-family-heading']);
    expect(css.variables['--spacing-md']).toBe(css.darkVariables['--spacing-md']);
    expect(css.variables['--color-background']).not.toBe(css.darkVariables['--color-background']);
  });

  it('produces dark palette for dual-mode presets', () => {
    const resolved = new ThemeResolver().resolve({ tenantTheme: { preset: 'modern' } });
    const tokens = new TokenNormalizer().normalize(resolved);
    const rn = new ReactNativeEmitter().emit(tokens);

    expect(rn.dark.colors.background).not.toBe(rn.light.colors.background);
  });
});
