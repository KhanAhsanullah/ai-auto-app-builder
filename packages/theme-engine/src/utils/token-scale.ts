import type { Theme } from '@ai-commerce/config-schema';

/** Spacing scale multipliers keyed by density setting. */
const SPACING_DENSITY_MULTIPLIERS: Record<
  NonNullable<Theme['spacing']['density']>,
  readonly number[]
> = {
  compact: [1, 2, 3, 4, 5, 6],
  default: [1, 2, 4, 6, 8, 12],
  spacious: [2, 4, 6, 8, 10, 14],
};

const SPACING_SCALE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export type SpacingScaleKey = (typeof SPACING_SCALE_KEYS)[number];

export type SpacingScale = Record<SpacingScaleKey, string>;

/** Typography scale multipliers keyed by typography scale setting. */
const TYPOGRAPHY_SCALE_MULTIPLIERS: Record<
  Theme['typography']['scale'],
  Record<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl', number>
> = {
  compact: { xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.25, '2xl': 1.5 },
  default: { xs: 0.75, sm: 0.875, base: 1, lg: 1.25, xl: 1.5, '2xl': 1.875 },
  comfortable: { xs: 0.875, sm: 1, base: 1, lg: 1.375, xl: 1.625, '2xl': 2 },
};

export type TypographyScaleKey = keyof (typeof TYPOGRAPHY_SCALE_MULTIPLIERS)['default'];

export type TypographyScale = Record<TypographyScaleKey, string>;

/** Compute pixel spacing scale from resolved spacing configuration. */
export function computeSpacingScale(spacing: Theme['spacing']): SpacingScale {
  const density = spacing.density ?? 'default';
  const multipliers = SPACING_DENSITY_MULTIPLIERS[density];

  return SPACING_SCALE_KEYS.reduce((scale, key, index) => {
    scale[key] = `${spacing.unit * multipliers[index]!}px`;
    return scale;
  }, {} as SpacingScale);
}

/** Compute font-size scale from resolved typography configuration. */
export function computeTypographyScale(typography: Theme['typography']): TypographyScale {
  const baseFontSize = typography.baseFontSize ?? 16;
  const multipliers = TYPOGRAPHY_SCALE_MULTIPLIERS[typography.scale];

  return (Object.keys(multipliers) as TypographyScaleKey[]).reduce((scale, key) => {
    scale[key] = `${Math.round(baseFontSize * multipliers[key] * 100) / 100}px`;
    return scale;
  }, {} as TypographyScale);
}

/** Format a numeric radius token as a CSS pixel value. */
export function formatRadiusValue(value: number): string {
  return `${value}px`;
}
