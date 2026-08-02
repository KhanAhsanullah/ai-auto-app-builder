export { LivePreviewCoordinator } from './domain/live-preview.js';
export { ModeResolver } from './domain/mode-resolver.js';
export {
  ThemePluginRegistry,
  type ThemePluginContributor,
  type ThemePluginExtensionPoint,
} from './domain/plugin-extensions.js';
export { PresetRegistry } from './domain/preset-registry.js';
export { ThemeResolver } from './domain/theme-resolver.js';
export { TokenNormalizer } from './domain/token-normalizer.js';
export { ThemeCompiler } from './domain/theme-compiler.js';
export type { ThemeEmitterRegistry } from './domain/theme-emitter-registry.js';
export {
  BUNDLED_PRESETS,
  THEME_PLATFORM_DEFAULTS,
  THEME_VERTICAL_PRESETS,
  getVerticalThemeDefaults,
} from './defaults/index.js';
export {
  IncompleteCustomThemeException,
  PresetNotFoundException,
  ThemeCompilationException,
  ThemeEngineException,
  ThemeResolutionException,
} from './errors.js';
export {
  AdminDashboardTokenEmitter,
  CssVariablesEmitter,
  ReactNativeEmitter,
  TailwindEmitter,
} from './infrastructure/emitters/index.js';
export { PresetLoader } from './infrastructure/preset-loader.js';
export { DefaultThemeEmitterRegistry } from './infrastructure/theme-emitter-registry.js';
export { ThemeCache } from './infrastructure/theme-cache.js';
export type {
  AnyThemeEmitter,
  AdminDashboardSemanticTokens,
  AdminDashboardTokenOutput,
  BuiltInPreset,
  CompiledSurfaceArtifacts,
  CompiledThemeResult,
  CompileFromConfigInput,
  CompileFromResolvedInput,
  CssVariablesOutput,
  LivePreviewOptions,
  LivePreviewResult,
  NormalizedColorTokens,
  NormalizedComponentVariantTokens,
  NormalizedDesignTokens,
  NormalizedMotionTokens,
  NormalizedRadiusTokens,
  NormalizedSpacingTokens,
  NormalizedTypographyTokens,
  ReactNativeModeTheme,
  ReactNativeThemeOutput,
  ResolveThemeInput,
  ResolvedThemeResult,
  TailwindDarkModeConfig,
  TailwindThemeOutput,
  ThemeCacheEntry,
  ThemeCacheOptions,
  ThemeColorTokens,
  ThemeEmitter,
  ThemeHashPayload,
  ThemeLayers,
  ThemeMetadata,
  ThemeModes,
  ThemePatch,
  ThemeSurface,
} from './types.js';
export { computeThemeHash } from './utils/theme-hash.js';
