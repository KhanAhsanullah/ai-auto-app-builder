import type { Theme } from '@ai-commerce/config-schema';

import type { ThemeColorTokens, ThemeModes } from '../types.js';
import { deepMerge } from '../utils/deep-merge.js';

const DARK_FALLBACKS: Partial<ThemeColorTokens> = {
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  border: '#374151',
};

/** Resolves light and dark color token sets from a resolved theme. */
export class ModeResolver {
  /** Produce light and dark mode color palettes. */
  resolve(theme: Theme): ThemeModes {
    const light = this.toColorTokens(theme.colors);

    if (theme.darkMode?.enabled === false) {
      return { light, dark: { ...light } };
    }

    const darkOverrides = theme.darkMode?.colors ?? {};
    const dark = deepMerge(
      deepMerge({ ...light }, DARK_FALLBACKS),
      darkOverrides,
    ) as ThemeColorTokens;

    return { light, dark };
  }

  /** Whether dark mode is enabled for this theme. */
  isDarkModeEnabled(theme: Theme): boolean {
    return theme.darkMode?.enabled !== false;
  }

  /** Resolve the dark mode strategy (defaults to system / auto). */
  getStrategy(theme: Theme): NonNullable<Theme['darkMode']>['strategy'] {
    return theme.darkMode?.strategy ?? 'system';
  }

  private toColorTokens(colors: Theme['colors']): ThemeColorTokens {
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      text: colors.text,
      textMuted: colors.textMuted,
      border: colors.border,
      error: colors.error,
      success: colors.success,
      warning: colors.warning,
    };
  }
}
