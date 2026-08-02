import type { Tenant, Theme } from '@ai-commerce/config-schema';

/** Resolved theme metadata populated by the Theme Engine. */
export interface ThemeMetadata {
  themeVersion: number;
  createdAt?: string;
  updatedAt?: string;
  compiledAt: string;
  hash: string;
}

/** Color token map used by light and dark modes. */
export interface ThemeColorTokens {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted?: string;
  border?: string;
  error: string;
  success: string;
  warning: string;
}

/** Resolved theme modes after ModeResolver processing. */
export interface ThemeModes {
  light: ThemeColorTokens;
  dark: ThemeColorTokens;
}

/** Audit layers showing theme inheritance contributions. */
export interface ThemeLayers {
  platform: ThemePatch;
  vertical: ThemePatch;
  preset: ThemePatch;
  tenant: ThemePatch;
  environment: ThemePatch;
}

/** Partial theme patch supporting nested overrides (e.g. colors.primary only). */
export type ThemePatch = Partial<Omit<Theme, 'colors' | 'metadata'>> & {
  colors?: Partial<Theme['colors']>;
  metadata?: Partial<ThemeMetadata>;
};

/** Input for ThemeResolver. */
export interface ResolveThemeInput {
  tenantId?: string;
  environment?: string;
  vertical?: Tenant['vertical'];
  tenantTheme?: ThemePatch;
  environmentTheme?: ThemePatch;
  platformDefaults?: ThemePatch;
  verticalDefaults?: ThemePatch;
}

/** Output from ThemeResolver. */
export interface ResolvedThemeResult {
  theme: Theme;
  modes: ThemeModes;
  metadata: ThemeMetadata;
  layers: ThemeLayers;
  darkModeEnabled: boolean;
  modeStrategy: NonNullable<Theme['darkMode']>['strategy'];
}

/** Options for live preview sessions. */
export interface LivePreviewOptions {
  /** Skip metadata mutation for faster preview cycles. */
  skipMetadata?: boolean;
}

/** Live preview session result. */
export interface LivePreviewResult extends ResolvedThemeResult {
  preview: true;
  draftPatch: ThemePatch;
}

/** Canonical payload hashed for metadata.hash. */
export interface ThemeHashPayload {
  preset: Theme['preset'];
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  radius: Theme['radius'];
  elevation?: Theme['elevation'];
  motion?: Theme['motion'];
  componentVariants?: Theme['componentVariants'];
  darkMode?: Theme['darkMode'];
  modes: ThemeModes;
}

/** Preset identifiers excluding custom. */
export type BuiltInPreset = Exclude<Theme['preset'], 'custom'>;
