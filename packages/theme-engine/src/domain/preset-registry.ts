import type { Theme } from '@ai-commerce/config-schema';

import { BUNDLED_PRESETS } from '../defaults/index.js';
import { PresetNotFoundException } from '../errors.js';
import type { BuiltInPreset } from '../types.js';

/** Bundled presets cast to typed partial themes. */
const TYPED_PRESETS = BUNDLED_PRESETS as Record<BuiltInPreset, Partial<Theme>>;

/** Catalog of built-in theme preset templates. */
export class PresetRegistry {
  private readonly presets: Map<BuiltInPreset, Partial<Theme>>;

  constructor(initialPresets: Record<BuiltInPreset, Partial<Theme>> = TYPED_PRESETS) {
    this.presets = new Map(Object.entries(initialPresets) as [BuiltInPreset, Partial<Theme>][]);
  }

  /** List all registered built-in preset identifiers. */
  list(): BuiltInPreset[] {
    return [...this.presets.keys()];
  }

  /** Retrieve a preset template by identifier. */
  get(preset: BuiltInPreset): Partial<Theme> {
    const template = this.presets.get(preset);
    if (!template) {
      throw new PresetNotFoundException(preset);
    }

    return structuredClone(template);
  }

  /** Register or replace a preset template (for future Theme Plugins). */
  register(preset: BuiltInPreset, template: Partial<Theme>): void {
    this.presets.set(preset, structuredClone(template));
  }

  /** Check whether a preset identifier is registered. */
  has(preset: string): preset is BuiltInPreset {
    return this.presets.has(preset as BuiltInPreset);
  }
}
