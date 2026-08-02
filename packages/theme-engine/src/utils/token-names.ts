import type { ThemeColorTokens } from '../types.js';

/** Canonical CSS custom property names for color tokens. */
export const COLOR_TOKEN_NAMES: Record<keyof ThemeColorTokens, string> = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  background: '--color-background',
  surface: '--color-surface',
  text: '--color-text',
  textMuted: '--color-text-muted',
  border: '--color-border',
  error: '--color-error',
  success: '--color-success',
  warning: '--color-warning',
};

/** Canonical CSS custom property names for non-color design tokens. */
export const DESIGN_TOKEN_NAMES = {
  fontFamilyHeading: '--font-family-heading',
  fontFamilyBody: '--font-family-body',
  fontSizeXs: '--font-size-xs',
  fontSizeSm: '--font-size-sm',
  fontSizeBase: '--font-size-base',
  fontSizeLg: '--font-size-lg',
  fontSizeXl: '--font-size-xl',
  fontSize2xl: '--font-size-2xl',
  spacingUnit: '--spacing-unit',
  spacingXs: '--spacing-xs',
  spacingSm: '--spacing-sm',
  spacingMd: '--spacing-md',
  spacingLg: '--spacing-lg',
  spacingXl: '--spacing-xl',
  spacing2xl: '--spacing-2xl',
  radiusSm: '--radius-sm',
  radiusMd: '--radius-md',
  radiusLg: '--radius-lg',
  radiusFull: '--radius-full',
  elevation: '--elevation',
  motionEnabled: '--motion-enabled',
  motionDuration: '--motion-duration',
  componentButton: '--component-button',
  componentInput: '--component-input',
  componentCard: '--component-card',
} as const;

/** Convert a camelCase token key to a kebab-case Tailwind token name. */
export function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
