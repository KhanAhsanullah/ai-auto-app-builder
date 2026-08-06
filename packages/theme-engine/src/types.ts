import type {
  EnvironmentSettings,
  Tenant,
  TenantConfiguration,
  Theme,
} from '@ai-commerce/config-schema';

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

/** Supported theme compilation output surfaces. */
export type ThemeSurface = 'css' | 'tailwind' | 'react-native' | 'admin-dashboard';

/** Normalized color tokens with required optional fields filled. */
export interface NormalizedColorTokens {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

/** Normalized typography tokens derived from resolved theme. */
export interface NormalizedTypographyTokens {
  fontFamilyHeading: string;
  fontFamilyBody: string;
  scale: Theme['typography']['scale'];
  baseFontSize: number;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

/** Normalized spacing tokens derived from resolved theme. */
export interface NormalizedSpacingTokens {
  unit: Theme['spacing']['unit'];
  density: NonNullable<Theme['spacing']['density']>;
  scale: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

/** Normalized radius tokens as CSS-ready values. */
export interface NormalizedRadiusTokens {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/** Normalized motion tokens. */
export interface NormalizedMotionTokens {
  enabled: boolean;
  durationMs: number;
}

/** Normalized component variant tokens. */
export interface NormalizedComponentVariantTokens {
  button: 'filled' | 'outline' | 'ghost';
  input: 'outline' | 'filled' | 'underline';
  card: 'elevated' | 'outlined' | 'flat';
}

/** Canonical normalized design tokens consumed by all emitters. */
export interface NormalizedDesignTokens {
  preset: Theme['preset'];
  modes: {
    light: NormalizedColorTokens;
    dark: NormalizedColorTokens;
  };
  typography: NormalizedTypographyTokens;
  spacing: NormalizedSpacingTokens;
  radius: NormalizedRadiusTokens;
  elevation: NonNullable<Theme['elevation']>;
  motion: NormalizedMotionTokens;
  componentVariants: NormalizedComponentVariantTokens;
  metadata: ThemeMetadata;
  darkModeEnabled: boolean;
  modeStrategy: NonNullable<Theme['darkMode']>['strategy'];
}

/** CSS variables emitter output. */
export interface CssVariablesOutput {
  surface: 'css';
  css: string;
  variables: Record<string, string>;
  darkVariables: Record<string, string>;
}

/** Valid Tailwind CSS darkMode configuration values. */
export type TailwindDarkModeConfig = 'media' | 'class' | ['class', string];

/** Tailwind theme extension emitter output. */
export interface TailwindThemeOutput {
  surface: 'tailwind';
  config: {
    theme: {
      extend: {
        colors: Record<string, string>;
        fontFamily: Record<string, string[]>;
        fontSize: Record<string, string>;
        spacing: Record<string, string>;
        borderRadius: Record<string, string>;
        transitionDuration: Record<string, string>;
      };
    };
    darkMode: TailwindDarkModeConfig;
  };
}

/** React Native theme emitter output. */
export interface ReactNativeThemeOutput {
  surface: 'react-native';
  light: ReactNativeModeTheme;
  dark: ReactNativeModeTheme;
  darkModeEnabled: boolean;
  modeStrategy: NonNullable<Theme['darkMode']>['strategy'];
}

/** Per-mode React Native theme bundle. */
export interface ReactNativeModeTheme {
  colors: NormalizedColorTokens;
  typography: NormalizedTypographyTokens;
  spacing: NormalizedSpacingTokens;
  radius: NormalizedRadiusTokens;
  elevation: NonNullable<Theme['elevation']>;
  motion: NormalizedMotionTokens;
  componentVariants: NormalizedComponentVariantTokens;
}

/** Admin dashboard semantic token mapping. */
export interface AdminDashboardSemanticTokens {
  layout: {
    background: string;
    surface: string;
    border: string;
  };
  navigation: {
    background: string;
    text: string;
    textMuted: string;
    active: string;
  };
  content: {
    background: string;
    text: string;
    textMuted: string;
  };
  actions: {
    primary: string;
    secondary: string;
    destructive: string;
  };
  feedback: {
    error: string;
    success: string;
    warning: string;
  };
}

/** Admin dashboard token emitter output. */
export interface AdminDashboardTokenOutput {
  surface: 'admin-dashboard';
  css: string;
  variables: Record<string, string>;
  darkVariables: Record<string, string>;
  semantic: {
    light: AdminDashboardSemanticTokens;
    dark: AdminDashboardSemanticTokens;
  };
}

/** Map of compiled artifacts keyed by surface. */
export type CompiledSurfaceArtifacts = {
  css: CssVariablesOutput;
  tailwind: TailwindThemeOutput;
  'react-native': ReactNativeThemeOutput;
  'admin-dashboard': AdminDashboardTokenOutput;
};

/** Result of compiling a resolved theme for one or more surfaces. */
export interface CompiledThemeResult<TSurfaces extends ThemeSurface = ThemeSurface> {
  tokens: NormalizedDesignTokens;
  metadata: ThemeMetadata;
  artifacts: Pick<CompiledSurfaceArtifacts, TSurfaces>;
  compiledAt: string;
}

/** Input for ThemeCompiler when starting from resolved theme output. */
export interface CompileFromResolvedInput {
  resolved: ResolvedThemeResult;
  surfaces?: ThemeSurface[];
}

/** Input for ThemeCompiler when starting from resolver input. */
export interface CompileFromConfigInput extends ResolveThemeInput {
  surfaces?: ThemeSurface[];
}

/** Theme cache entry metadata. */
export interface ThemeCacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt?: number;
}

/** Options for ThemeCache. */
export interface ThemeCacheOptions {
  /** Time-to-live in milliseconds. Omit for no expiration. */
  ttlMs?: number;
  /** Maximum number of entries before LRU eviction. Default: 100. */
  maxEntries?: number;
}

/** Any registered surface emitter implementation. */
export type AnyThemeEmitter =
  | ThemeEmitter<'css'>
  | ThemeEmitter<'tailwind'>
  | ThemeEmitter<'react-native'>
  | ThemeEmitter<'admin-dashboard'>;

/** Contract implemented by all surface emitters. */
export interface ThemeEmitter<TSurface extends ThemeSurface = ThemeSurface> {
  readonly surface: TSurface;
  emit(tokens: NormalizedDesignTokens): CompiledSurfaceArtifacts[TSurface];
}

/** Resolved configuration input for theme resolution (Config Runtime compatible). */
export interface ThemeConfigSource {
  config: Readonly<{
    theme: Theme;
    tenant?: TenantConfiguration['tenant'];
  }>;
  layers: Readonly<{
    environment?: Readonly<{
      theme?: ThemePatch;
    }>;
  }>;
  environment: EnvironmentSettings['current'];
  vertical: Tenant['vertical'];
}

/** Options for ThemeProvider initialization. */
export interface ThemeProviderOptions {
  cache?: ThemeCacheOptions | false;
}

/** Input for ThemeProvider.provide(). */
export interface ProvideThemeInput extends ResolveThemeInput {
  surfaces?: ThemeSurface[];
  skipCache?: boolean;
}

/** Input for ThemeProvider.provideFromConfig(). */
export interface ProvideThemeFromConfigInput {
  source: ThemeConfigSource;
  surfaces?: ThemeSurface[];
  skipCache?: boolean;
}

/** Result from ThemeProvider including resolved and compiled theme output. */
export interface ThemeProviderResult<
  TSurfaces extends ThemeSurface = ThemeSurface,
> extends CompiledThemeResult<TSurfaces> {
  resolved: ResolvedThemeResult;
  fromCache: boolean;
}
