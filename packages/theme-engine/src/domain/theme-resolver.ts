import type { Theme } from '@ai-commerce/config-schema';
import { themeSchema } from '@ai-commerce/config-schema';

import { THEME_PLATFORM_DEFAULTS } from '../defaults/platform-theme.js';
import { getVerticalThemeDefaults } from '../defaults/vertical-themes.js';
import { IncompleteCustomThemeException, ThemeResolutionException } from '../errors.js';
import { PresetLoader } from '../infrastructure/preset-loader.js';
import type {
  ThemePatch,
  ResolveThemeInput,
  ResolvedThemeResult,
  ThemeHashPayload,
  ThemeLayers,
  ThemeMetadata,
} from '../types.js';
import { deepMerge, shallowMergeThemeSections } from '../utils/deep-merge.js';
import { computeThemeHash } from '../utils/theme-hash.js';
import { ModeResolver } from './mode-resolver.js';
import { ThemePluginRegistry } from './plugin-extensions.js';
import type { PresetRegistry } from './preset-registry.js';

const CUSTOM_REQUIRED_PATHS = [
  'colors.primary',
  'colors.secondary',
  'colors.background',
  'colors.surface',
  'colors.text',
  'colors.error',
  'colors.success',
  'colors.warning',
  'typography.fontFamily.heading',
  'typography.fontFamily.body',
  'typography.scale',
  'spacing.unit',
  'radius.sm',
  'radius.md',
  'radius.lg',
] as const;

/** Resolves theme configuration through the inheritance and preset chain. */
export class ThemeResolver {
  private readonly presetLoader: PresetLoader;
  private readonly modeResolver: ModeResolver;
  private readonly pluginRegistry: ThemePluginRegistry;

  constructor(options?: {
    presetLoader?: PresetLoader;
    modeResolver?: ModeResolver;
    pluginRegistry?: ThemePluginRegistry;
  }) {
    this.presetLoader = options?.presetLoader ?? new PresetLoader();
    this.modeResolver = options?.modeResolver ?? new ModeResolver();
    this.pluginRegistry = options?.pluginRegistry ?? new ThemePluginRegistry();
  }

  /** Expose preset registry for plugin extension points. */
  getPresetRegistry(): PresetRegistry {
    return this.presetLoader.getRegistry();
  }

  /** Expose plugin registry for future Theme Plugins. */
  getPluginRegistry(): ThemePluginRegistry {
    return this.pluginRegistry;
  }

  /** Resolve a theme from layered configuration input. */
  resolve(input: ResolveThemeInput): ResolvedThemeResult {
    const platformLayer = input.platformDefaults ?? THEME_PLATFORM_DEFAULTS;
    const verticalLayer =
      input.verticalDefaults ??
      (input.vertical !== undefined ? getVerticalThemeDefaults(input.vertical) : {});
    const tenantLayer = input.tenantTheme ?? {};
    const environmentLayer = input.environmentTheme ?? {};

    const presetHint = (tenantLayer.preset ??
      verticalLayer.preset ??
      platformLayer.preset ??
      'default') as Theme['preset'];

    let presetLayer: Partial<Theme> = {};
    if (presetHint !== 'custom') {
      if (!this.presetLoader.getRegistry().has(presetHint)) {
        throw new ThemeResolutionException(`Unknown theme preset: ${presetHint}`);
      }
      presetLayer = this.presetLoader.load(presetHint);
    }

    let merged: Partial<Theme> = deepMerge({}, platformLayer);
    merged = deepMerge(merged, verticalLayer);
    merged = deepMerge(merged, presetLayer);
    merged = deepMerge(merged, tenantLayer);

    if (Object.keys(environmentLayer).length > 0) {
      merged = shallowMergeThemeSections(merged, environmentLayer);
    }

    merged.preset = (tenantLayer.preset ?? presetHint) as Theme['preset'];

    if (merged.preset === 'custom') {
      this.assertCustomThemeComplete(tenantLayer);
    }

    const validation = themeSchema.safeParse(merged);
    if (!validation.success) {
      throw new ThemeResolutionException(
        `Resolved theme failed schema validation: ${validation.error.message}`,
      );
    }

    const theme = validation.data as Theme;
    const modes = this.modeResolver.resolve(theme);
    const metadata = this.buildMetadata(theme, modes, input);
    const layers: ThemeLayers = {
      platform: platformLayer,
      vertical: verticalLayer,
      preset: presetLayer,
      tenant: tenantLayer,
      environment: environmentLayer,
    };

    let result: ResolvedThemeResult = {
      theme: { ...theme, metadata: { ...theme.metadata, ...metadata } },
      modes,
      metadata,
      layers,
      darkModeEnabled: this.modeResolver.isDarkModeEnabled(theme),
      modeStrategy: this.modeResolver.getStrategy(theme),
    };

    result = this.pluginRegistry.apply(result);

    return result;
  }

  private buildMetadata(
    theme: Theme,
    modes: ResolvedThemeResult['modes'],
    _input: ResolveThemeInput,
  ): ThemeMetadata {
    const hashPayload: ThemeHashPayload = {
      preset: theme.preset,
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      radius: theme.radius,
      elevation: theme.elevation,
      motion: theme.motion,
      componentVariants: theme.componentVariants,
      darkMode: theme.darkMode,
      modes,
    };

    const compiledAt = new Date().toISOString();

    return {
      themeVersion: theme.metadata?.themeVersion ?? 0,
      createdAt: theme.metadata?.createdAt,
      updatedAt: theme.metadata?.updatedAt,
      compiledAt,
      hash: computeThemeHash(hashPayload),
    };
  }

  private assertCustomThemeComplete(tenantLayer: ThemePatch): void {
    const missing: string[] = [];

    for (const path of CUSTOM_REQUIRED_PATHS) {
      if (!this.hasPath(tenantLayer, path)) {
        missing.push(path);
      }
    }

    if (missing.length > 0) {
      throw new IncompleteCustomThemeException(missing);
    }
  }

  private hasPath(obj: ThemePatch, path: string): boolean {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current !== undefined && current !== null;
  }
}
