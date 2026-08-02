import type { Tenant, Theme } from '@ai-commerce/config-schema';

/** Vertical-specific theme partials keyed by tenant vertical. */
export const THEME_VERTICAL_PRESETS: Partial<Record<Tenant['vertical'], Partial<Theme>>> = {
  ecommerce: {
    colors: {
      primary: '#2563EB',
      secondary: '#64748B',
    },
  } as Partial<Theme>,
  grocery: {
    preset: 'modern',
    colors: {
      primary: '#16A34A',
      secondary: '#F59E0B',
    },
  } as Partial<Theme>,
  restaurant: {
    preset: 'modern',
    colors: {
      primary: '#DC2626',
      secondary: '#F59E0B',
    },
  } as Partial<Theme>,
  pharmacy: {
    preset: 'minimal',
    colors: {
      primary: '#0284C7',
      secondary: '#64748B',
    },
  } as Partial<Theme>,
  fashion: {
    preset: 'luxury',
    colors: {
      primary: '#18181B',
      secondary: '#71717A',
    },
  } as Partial<Theme>,
  electronics: {
    preset: 'dark',
    colors: {
      primary: '#818CF8',
      secondary: '#A78BFA',
    },
  } as Partial<Theme>,
};

/** Resolve vertical theme defaults for a tenant vertical identifier. */
export function getVerticalThemeDefaults(vertical: Tenant['vertical']): Partial<Theme> {
  return THEME_VERTICAL_PRESETS[vertical] ?? {};
}
