import { describe, expect, it } from 'vitest';

import { ThemeCompilationException } from '../src/errors.js';
import { CssVariablesEmitter } from '../src/infrastructure/emitters/css-variables-emitter.js';
import { DefaultThemeEmitterRegistry } from '../src/infrastructure/theme-emitter-registry.js';
import { TokenNormalizer } from '../src/domain/token-normalizer.js';
import { ThemeResolver } from '../src/domain/theme-resolver.js';

describe('DefaultThemeEmitterRegistry', () => {
  const registry = new DefaultThemeEmitterRegistry();

  it('registers all built-in surface emitters', () => {
    expect(registry.has('css')).toBe(true);
    expect(registry.has('tailwind')).toBe(true);
    expect(registry.has('react-native')).toBe(true);
    expect(registry.has('admin-dashboard')).toBe(true);
    expect(registry.has('unknown' as 'css')).toBe(false);
  });

  it('emits artifacts through the registered emitter abstraction', () => {
    const tokens = new TokenNormalizer().normalize(
      new ThemeResolver().resolve({ tenantTheme: { preset: 'modern' } }),
    );

    expect(registry.emit('css', tokens).surface).toBe('css');
    expect(registry.emit('tailwind', tokens).surface).toBe('tailwind');
  });

  it('throws when emitting for an unregistered surface', () => {
    const tokens = new TokenNormalizer().normalize(
      new ThemeResolver().resolve({ tenantTheme: { preset: 'modern' } }),
    );

    expect(() => registry.emit('unknown' as 'css', tokens)).toThrow(ThemeCompilationException);
  });

  it('accepts custom emitter implementations', () => {
    const customRegistry = new DefaultThemeEmitterRegistry([new CssVariablesEmitter()]);

    expect(customRegistry.has('css')).toBe(true);
    expect(customRegistry.has('tailwind')).toBe(false);
  });
});
