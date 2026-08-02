import type { NormalizedDesignTokens, TailwindThemeOutput, ThemeEmitter } from '../../types.js';
import { COLOR_TOKEN_NAMES, DESIGN_TOKEN_NAMES } from '../../utils/token-names.js';
import { buildSharedDesignVariables, resolveTailwindDarkMode } from './emitter-utils.js';

/** Emits Tailwind CSS theme extension configuration. */
export class TailwindEmitter implements ThemeEmitter<'tailwind'> {
  readonly surface = 'tailwind' as const;

  emit(tokens: NormalizedDesignTokens): TailwindThemeOutput {
    const shared = buildSharedDesignVariables(tokens);

    const colors = Object.fromEntries(
      Object.entries(COLOR_TOKEN_NAMES).map(([key, cssVar]) => [key, `var(${cssVar})`]),
    );

    return {
      surface: this.surface,
      config: {
        theme: {
          extend: {
            colors,
            fontFamily: {
              heading: [tokens.typography.fontFamilyHeading, 'sans-serif'],
              body: [tokens.typography.fontFamilyBody, 'sans-serif'],
            },
            fontSize: {
              xs: shared[DESIGN_TOKEN_NAMES.fontSizeXs]!,
              sm: shared[DESIGN_TOKEN_NAMES.fontSizeSm]!,
              base: shared[DESIGN_TOKEN_NAMES.fontSizeBase]!,
              lg: shared[DESIGN_TOKEN_NAMES.fontSizeLg]!,
              xl: shared[DESIGN_TOKEN_NAMES.fontSizeXl]!,
              '2xl': shared[DESIGN_TOKEN_NAMES.fontSize2xl]!,
            },
            spacing: {
              unit: shared[DESIGN_TOKEN_NAMES.spacingUnit]!,
              xs: shared[DESIGN_TOKEN_NAMES.spacingXs]!,
              sm: shared[DESIGN_TOKEN_NAMES.spacingSm]!,
              md: shared[DESIGN_TOKEN_NAMES.spacingMd]!,
              lg: shared[DESIGN_TOKEN_NAMES.spacingLg]!,
              xl: shared[DESIGN_TOKEN_NAMES.spacingXl]!,
              '2xl': shared[DESIGN_TOKEN_NAMES.spacing2xl]!,
            },
            borderRadius: {
              sm: shared[DESIGN_TOKEN_NAMES.radiusSm]!,
              md: shared[DESIGN_TOKEN_NAMES.radiusMd]!,
              lg: shared[DESIGN_TOKEN_NAMES.radiusLg]!,
              full: shared[DESIGN_TOKEN_NAMES.radiusFull]!,
            },
            transitionDuration: {
              DEFAULT: shared[DESIGN_TOKEN_NAMES.motionDuration]!,
            },
          },
        },
        darkMode: resolveTailwindDarkMode(tokens.modeStrategy),
      },
    };
  }
}
