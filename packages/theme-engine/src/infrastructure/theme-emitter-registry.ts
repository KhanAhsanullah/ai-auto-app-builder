import type { ThemeEmitterRegistry } from '../domain/theme-emitter-registry.js';
import { ThemeCompilationException } from '../errors.js';
import type {
  AnyThemeEmitter,
  CompiledSurfaceArtifacts,
  NormalizedDesignTokens,
  ThemeSurface,
} from '../types.js';
import { AdminDashboardTokenEmitter } from './emitters/admin-dashboard-emitter.js';
import { CssVariablesEmitter } from './emitters/css-variables-emitter.js';
import { ReactNativeEmitter } from './emitters/react-native-emitter.js';
import { TailwindEmitter } from './emitters/tailwind-emitter.js';

/** Default registry wiring all built-in surface emitters. */
export class DefaultThemeEmitterRegistry implements ThemeEmitterRegistry {
  private readonly emitters = new Map<ThemeSurface, AnyThemeEmitter>();

  constructor(emitters?: AnyThemeEmitter[]) {
    const defaults: AnyThemeEmitter[] = emitters ?? [
      new CssVariablesEmitter(),
      new TailwindEmitter(),
      new ReactNativeEmitter(),
      new AdminDashboardTokenEmitter(),
    ];

    for (const emitter of defaults) {
      this.emitters.set(emitter.surface, emitter);
    }
  }

  emit<T extends ThemeSurface>(
    surface: T,
    tokens: NormalizedDesignTokens,
  ): CompiledSurfaceArtifacts[T] {
    const emitter = this.emitters.get(surface);

    if (!emitter) {
      throw new ThemeCompilationException(`No emitter registered for surface: ${surface}`);
    }

    return emitter.emit(tokens) as CompiledSurfaceArtifacts[T];
  }

  has(surface: ThemeSurface): boolean {
    return this.emitters.has(surface);
  }
}
