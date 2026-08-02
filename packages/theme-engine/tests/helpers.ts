import type { Theme } from '@ai-commerce/config-schema';

import type { ThemePatch } from '../src/types.js';

/** Minimal valid custom theme for testing. */
export const CUSTOM_THEME_FIXTURE: Theme = {
  preset: 'custom',
  colors: {
    primary: '#000000',
    secondary: '#666666',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#111111',
    error: '#FF0000',
    success: '#00AA00',
    warning: '#FFAA00',
  },
  typography: {
    fontFamily: { heading: 'Arial', body: 'Arial' },
    scale: 'default',
  },
  spacing: { unit: 4 },
  radius: { sm: 4, md: 8, lg: 12 },
};

/** Partial tenant override for preview tests. */
export const PRIMARY_OVERRIDE: ThemePatch = {
  colors: { primary: '#FF0000' },
};
