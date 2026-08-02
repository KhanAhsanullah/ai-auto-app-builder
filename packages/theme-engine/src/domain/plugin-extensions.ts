import type { Theme } from '@ai-commerce/config-schema';

import type { ResolvedThemeResult } from '../types.js';
import type { PresetRegistry } from './preset-registry.js';

/**
 * Extension point contract for future Theme Plugins (Sprint 5+).
 * Plugins may contribute preset templates or transform resolved themes.
 */
export interface ThemePluginContributor {
  readonly id: string;
  readonly version: string;
  extendPresets?(registry: PresetRegistry): void;
  extendResolvedTheme?(result: ResolvedThemeResult): ResolvedThemeResult;
}

/**
 * Registry for Theme Plugin contributors.
 * Sprint 2: registration only — apply() is a no-op pass-through until Plugin Engine.
 */
export class ThemePluginRegistry {
  private readonly contributors = new Map<string, ThemePluginContributor>();

  /** Register a theme plugin contributor. */
  register(contributor: ThemePluginContributor): void {
    this.contributors.set(contributor.id, contributor);
  }

  /** Unregister a theme plugin contributor. */
  unregister(id: string): boolean {
    return this.contributors.delete(id);
  }

  /** List registered contributor identifiers. */
  list(): string[] {
    return [...this.contributors.keys()];
  }

  /**
   * Apply registered plugin extensions to a resolved theme.
   * Currently invokes extendResolvedTheme when present; preset extensions
   * are applied at registration time via extendPresets.
   */
  apply(result: ResolvedThemeResult): ResolvedThemeResult {
    let current = result;

    for (const contributor of this.contributors.values()) {
      if (contributor.extendResolvedTheme) {
        current = contributor.extendResolvedTheme(current);
      }
    }

    return current;
  }

  /** Invoke extendPresets on all registered contributors. */
  applyPresetExtensions(registry: PresetRegistry): void {
    for (const contributor of this.contributors.values()) {
      contributor.extendPresets?.(registry);
    }
  }
}

/** Type alias for plugin extension surface documentation. */
export type ThemePluginExtensionPoint = ThemePluginContributor;

/** Re-export Theme type for plugin authors. */
export type { Theme };
