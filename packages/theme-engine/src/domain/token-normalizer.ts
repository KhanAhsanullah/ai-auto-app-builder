import type { ThemeColorTokens } from '../types.js';
import type {
  NormalizedColorTokens,
  NormalizedComponentVariantTokens,
  NormalizedDesignTokens,
  NormalizedMotionTokens,
  NormalizedRadiusTokens,
  NormalizedSpacingTokens,
  NormalizedTypographyTokens,
  ResolvedThemeResult,
} from '../types.js';
import {
  formatRadiusValue,
  computeSpacingScale,
  computeTypographyScale,
} from '../utils/token-scale.js';

/** Normalizes resolved theme output into canonical design tokens for emitters. */
export class TokenNormalizer {
  /** Produce normalized design tokens from a resolved theme. */
  normalize(resolved: ResolvedThemeResult): NormalizedDesignTokens {
    const { theme, modes, metadata, darkModeEnabled, modeStrategy } = resolved;

    return {
      preset: theme.preset,
      modes: {
        light: this.normalizeColorTokens(modes.light),
        dark: this.normalizeColorTokens(modes.dark),
      },
      typography: this.normalizeTypography(theme),
      spacing: this.normalizeSpacing(theme),
      radius: this.normalizeRadius(theme),
      elevation: theme.elevation ?? 'subtle',
      motion: this.normalizeMotion(theme),
      componentVariants: this.normalizeComponentVariants(theme),
      metadata,
      darkModeEnabled,
      modeStrategy,
    };
  }

  private normalizeColorTokens(colors: ThemeColorTokens): NormalizedColorTokens {
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      text: colors.text,
      textMuted: colors.textMuted ?? colors.text,
      border: colors.border ?? colors.surface,
      error: colors.error,
      success: colors.success,
      warning: colors.warning,
    };
  }

  private normalizeTypography(theme: ResolvedThemeResult['theme']): NormalizedTypographyTokens {
    const fontSizeScale = computeTypographyScale(theme.typography);

    return {
      fontFamilyHeading: theme.typography.fontFamily.heading,
      fontFamilyBody: theme.typography.fontFamily.body,
      scale: theme.typography.scale,
      baseFontSize: theme.typography.baseFontSize ?? 16,
      fontSize: fontSizeScale,
    };
  }

  private normalizeSpacing(theme: ResolvedThemeResult['theme']): NormalizedSpacingTokens {
    const spacingScale = computeSpacingScale(theme.spacing);

    return {
      unit: theme.spacing.unit,
      density: theme.spacing.density ?? 'default',
      scale: spacingScale,
    };
  }

  private normalizeRadius(theme: ResolvedThemeResult['theme']): NormalizedRadiusTokens {
    return {
      sm: formatRadiusValue(theme.radius.sm),
      md: formatRadiusValue(theme.radius.md),
      lg: formatRadiusValue(theme.radius.lg),
      full: formatRadiusValue(theme.radius.full ?? 9999),
    };
  }

  private normalizeMotion(theme: ResolvedThemeResult['theme']): NormalizedMotionTokens {
    return {
      enabled: theme.motion?.enabled ?? true,
      durationMs: theme.motion?.durationMs ?? 200,
    };
  }

  private normalizeComponentVariants(
    theme: ResolvedThemeResult['theme'],
  ): NormalizedComponentVariantTokens {
    return {
      button: theme.componentVariants?.button ?? 'filled',
      input: theme.componentVariants?.input ?? 'outline',
      card: theme.componentVariants?.card ?? 'elevated',
    };
  }
}
