import type { AiSettings, TenantConfiguration } from '@ai-commerce/config-schema';
import type { ConfigProviderResult } from '@ai-commerce/config-runtime';

/** Config sources that carry AI settings. */
export type AiSettingsConfigSource =
  | AiSettings
  | Pick<TenantConfiguration, 'aiSettings'>
  | Pick<ConfigProviderResult, 'config'>
  | { config: Pick<TenantConfiguration, 'aiSettings'> };

/** Extract AiSettings from raw settings, tenant config, or ConfigProvider result. */
export function toAiSettings(source: AiSettingsConfigSource): AiSettings {
  if ('enabled' in source && 'provider' in source && 'generation' in source) {
    return source;
  }

  if ('config' in source) {
    return source.config.aiSettings;
  }

  return source.aiSettings;
}
