import type { ThemeEmitterRegistry } from '../domain/theme-emitter-registry.js';
import { ThemeCompiler } from '../domain/theme-compiler.js';
import { ThemeProvider } from '../domain/theme-provider.js';
import { ThemeResolver } from '../domain/theme-resolver.js';
import type { ThemeProviderOptions } from '../types.js';
import { DefaultThemeEmitterRegistry } from './theme-emitter-registry.js';

/** Options for creating a ThemeProvider with default infrastructure wiring. */
export interface CreateThemeProviderOptions extends ThemeProviderOptions {
  resolver?: ThemeResolver;
  emitterRegistry?: ThemeEmitterRegistry;
}

/** Create a ThemeProvider with default resolver, compiler, and emitter registry wiring. */
export function createThemeProvider(options?: CreateThemeProviderOptions): ThemeProvider {
  const resolver = options?.resolver ?? new ThemeResolver();
  const compiler = new ThemeCompiler({
    resolver,
    emitterRegistry: options?.emitterRegistry ?? new DefaultThemeEmitterRegistry(),
    cache: options?.cache,
  });

  return new ThemeProvider(resolver, compiler);
}
