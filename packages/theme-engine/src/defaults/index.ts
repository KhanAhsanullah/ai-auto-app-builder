import defaultPreset from './presets/default.json' with { type: 'json' };
import darkPreset from './presets/dark.json' with { type: 'json' };
import luxuryPreset from './presets/luxury.json' with { type: 'json' };
import minimalPreset from './presets/minimal.json' with { type: 'json' };
import modernPreset from './presets/modern.json' with { type: 'json' };

export { THEME_PLATFORM_DEFAULTS } from './platform-theme.js';
export { THEME_VERTICAL_PRESETS, getVerticalThemeDefaults } from './vertical-themes.js';

/** Bundled preset templates keyed by preset identifier. */
export const BUNDLED_PRESETS = {
  default: defaultPreset,
  minimal: minimalPreset,
  modern: modernPreset,
  luxury: luxuryPreset,
  dark: darkPreset,
} as const;
