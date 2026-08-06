import type { ResolveThemeInput, ThemeConfigSource, ThemePatch } from '../types.js';
import type {
  EnvironmentSettings,
  Tenant,
  TenantConfiguration,
  Theme,
} from '@ai-commerce/config-schema';

/** Input shape produced by ConfigProvider (structural; no config-runtime import). */
export interface ConfigProviderThemeInput {
  readonly config: Readonly<{
    theme: Theme;
    tenant?: TenantConfiguration['tenant'];
  }>;
  readonly layers: Readonly<{
    readonly environment?: Readonly<{
      theme?: unknown;
    }>;
  }>;
  readonly environment: EnvironmentSettings['current'];
  readonly vertical: Tenant['vertical'];
}

/** Map resolved configuration output to theme resolver input without re-resolving config. */
export function toResolveThemeInput(source: ThemeConfigSource): ResolveThemeInput {
  return {
    tenantId: source.config.tenant?.id,
    environment: source.environment,
    vertical: source.vertical,
    tenantTheme: source.config.theme,
    environmentTheme: source.layers.environment?.theme,
  };
}

/** Normalize Config Runtime output into a ThemeConfigSource. */
export function themeConfigSourceFromProviderResult(
  result: ConfigProviderThemeInput,
): ThemeConfigSource {
  return {
    config: {
      theme: result.config.theme,
      tenant: result.config.tenant,
    },
    layers: {
      environment: result.layers.environment
        ? { theme: result.layers.environment.theme as ThemePatch | undefined }
        : undefined,
    },
    environment: result.environment,
    vertical: result.vertical,
  };
}
