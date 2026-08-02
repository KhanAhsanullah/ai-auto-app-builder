import type { Theme } from '@ai-commerce/config-schema';

import { BUNDLED_PRESETS } from '../defaults/index.js';
import { PresetNotFoundException } from '../errors.js';
import type { BuiltInPreset } from '../types.js';
import { PresetRegistry } from '../domain/preset-registry.js';

const TYPED_PRESETS = BUNDLED_PRESETS as Record<BuiltInPreset, Partial<Theme>>;

/** Loads preset templates from bundled JSON or an injected registry. */
export class PresetLoader {
  constructor(private readonly registry: PresetRegistry = new PresetRegistry(TYPED_PRESETS)) {}

  /** Return the underlying preset registry for extension points. */
  getRegistry(): PresetRegistry {
    return this.registry;
  }

  /** Load a preset template by identifier. */
  load(preset: BuiltInPreset): Partial<Theme> {
    if (!this.registry.has(preset)) {
      throw new PresetNotFoundException(preset);
    }

    return this.registry.get(preset);
  }

  /** List available built-in presets. */
  listPresets(): BuiltInPreset[] {
    return this.registry.list();
  }
}
