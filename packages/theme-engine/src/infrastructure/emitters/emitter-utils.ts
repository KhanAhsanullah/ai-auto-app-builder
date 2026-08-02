import type {
  NormalizedColorTokens,
  NormalizedDesignTokens,
  TailwindDarkModeConfig,
} from '../../types.js';
import { COLOR_TOKEN_NAMES, DESIGN_TOKEN_NAMES } from '../../utils/token-names.js';

/** Build CSS custom property map for a color mode. */
export function buildColorVariables(colors: NormalizedColorTokens): Record<string, string> {
  return (Object.keys(COLOR_TOKEN_NAMES) as Array<keyof NormalizedColorTokens>).reduce(
    (variables, key) => {
      variables[COLOR_TOKEN_NAMES[key]] = colors[key];
      return variables;
    },
    {} as Record<string, string>,
  );
}

/** Build shared CSS custom property map for non-color design tokens. */
export function buildSharedDesignVariables(tokens: NormalizedDesignTokens): Record<string, string> {
  const { typography, spacing, radius, elevation, motion, componentVariants } = tokens;

  return {
    [DESIGN_TOKEN_NAMES.fontFamilyHeading]: typography.fontFamilyHeading,
    [DESIGN_TOKEN_NAMES.fontFamilyBody]: typography.fontFamilyBody,
    [DESIGN_TOKEN_NAMES.fontSizeXs]: typography.fontSize.xs,
    [DESIGN_TOKEN_NAMES.fontSizeSm]: typography.fontSize.sm,
    [DESIGN_TOKEN_NAMES.fontSizeBase]: typography.fontSize.base,
    [DESIGN_TOKEN_NAMES.fontSizeLg]: typography.fontSize.lg,
    [DESIGN_TOKEN_NAMES.fontSizeXl]: typography.fontSize.xl,
    [DESIGN_TOKEN_NAMES.fontSize2xl]: typography.fontSize['2xl'],
    [DESIGN_TOKEN_NAMES.spacingUnit]: `${spacing.unit}px`,
    [DESIGN_TOKEN_NAMES.spacingXs]: spacing.scale.xs,
    [DESIGN_TOKEN_NAMES.spacingSm]: spacing.scale.sm,
    [DESIGN_TOKEN_NAMES.spacingMd]: spacing.scale.md,
    [DESIGN_TOKEN_NAMES.spacingLg]: spacing.scale.lg,
    [DESIGN_TOKEN_NAMES.spacingXl]: spacing.scale.xl,
    [DESIGN_TOKEN_NAMES.spacing2xl]: spacing.scale['2xl'],
    [DESIGN_TOKEN_NAMES.radiusSm]: radius.sm,
    [DESIGN_TOKEN_NAMES.radiusMd]: radius.md,
    [DESIGN_TOKEN_NAMES.radiusLg]: radius.lg,
    [DESIGN_TOKEN_NAMES.radiusFull]: radius.full,
    [DESIGN_TOKEN_NAMES.elevation]: elevation,
    [DESIGN_TOKEN_NAMES.motionEnabled]: motion.enabled ? '1' : '0',
    [DESIGN_TOKEN_NAMES.motionDuration]: `${motion.durationMs}ms`,
    [DESIGN_TOKEN_NAMES.componentButton]: componentVariants.button ?? 'filled',
    [DESIGN_TOKEN_NAMES.componentInput]: componentVariants.input ?? 'outline',
    [DESIGN_TOKEN_NAMES.componentCard]: componentVariants.card ?? 'elevated',
  };
}

/** Render CSS custom properties as a declaration block. */
export function renderCssBlock(selector: string, variables: Record<string, string>): string {
  const declarations = Object.entries(variables)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
}

/** Merge light and dark CSS variable blocks for a complete stylesheet. */
export function renderCssStylesheet(
  lightVariables: Record<string, string>,
  darkVariables: Record<string, string>,
): string {
  const blocks = [
    renderCssBlock(':root', lightVariables),
    renderCssBlock('[data-theme="dark"]', darkVariables),
  ];

  if (darkVariables !== lightVariables) {
    blocks.push(
      '@media (prefers-color-scheme: dark) {\n  :root {\n' +
        Object.entries(darkVariables)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([name, value]) => `    ${name}: ${value};`)
          .join('\n') +
        '\n  }\n}',
    );
  }

  return blocks.join('\n\n');
}

/** Resolve Tailwind dark mode strategy from theme mode strategy. */
export function resolveTailwindDarkMode(
  strategy: NormalizedDesignTokens['modeStrategy'],
): TailwindDarkModeConfig {
  switch (strategy) {
    case 'manual':
      return ['class', '[data-theme="dark"]'];
    case 'system':
      return 'media';
    case 'scheduled':
      return ['class', '[data-theme="dark"]'];
    default:
      return 'media';
  }
}
