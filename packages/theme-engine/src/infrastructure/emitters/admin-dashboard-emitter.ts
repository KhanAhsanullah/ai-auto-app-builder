import type {
  AdminDashboardSemanticTokens,
  AdminDashboardTokenOutput,
  NormalizedColorTokens,
  NormalizedDesignTokens,
  ThemeEmitter,
} from '../../types.js';
import {
  buildColorVariables,
  buildSharedDesignVariables,
  renderCssStylesheet,
} from './emitter-utils.js';

const ADMIN_TOKEN_PREFIX = '--admin';

/** Emits admin dashboard token bundles with semantic mappings. */
export class AdminDashboardTokenEmitter implements ThemeEmitter<'admin-dashboard'> {
  readonly surface = 'admin-dashboard' as const;

  emit(tokens: NormalizedDesignTokens): AdminDashboardTokenOutput {
    const shared = buildSharedDesignVariables(tokens);
    const lightColorVariables = this.buildAdminColorVariables(tokens.modes.light);
    const darkColorVariables = tokens.darkModeEnabled
      ? this.buildAdminColorVariables(tokens.modes.dark)
      : lightColorVariables;

    const lightVariables = { ...shared, ...lightColorVariables };
    const darkVariables = { ...shared, ...darkColorVariables };

    return {
      surface: this.surface,
      css: renderCssStylesheet(lightVariables, darkVariables),
      variables: lightVariables,
      darkVariables,
      semantic: {
        light: this.buildSemanticTokens(tokens.modes.light),
        dark: this.buildSemanticTokens(tokens.modes.dark),
      },
    };
  }

  private buildAdminColorVariables(colors: NormalizedColorTokens): Record<string, string> {
    const base = buildColorVariables(colors);

    return {
      ...base,
      [`${ADMIN_TOKEN_PREFIX}-sidebar-bg`]: colors.surface,
      [`${ADMIN_TOKEN_PREFIX}-sidebar-text`]: colors.text,
      [`${ADMIN_TOKEN_PREFIX}-sidebar-active`]: colors.primary,
      [`${ADMIN_TOKEN_PREFIX}-header-bg`]: colors.background,
      [`${ADMIN_TOKEN_PREFIX}-content-bg`]: colors.background,
    };
  }

  private buildSemanticTokens(colors: NormalizedColorTokens): AdminDashboardSemanticTokens {
    return {
      layout: {
        background: colors.background,
        surface: colors.surface,
        border: colors.border,
      },
      navigation: {
        background: colors.surface,
        text: colors.text,
        textMuted: colors.textMuted,
        active: colors.primary,
      },
      content: {
        background: colors.background,
        text: colors.text,
        textMuted: colors.textMuted,
      },
      actions: {
        primary: colors.primary,
        secondary: colors.secondary,
        destructive: colors.error,
      },
      feedback: {
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
      },
    };
  }
}
