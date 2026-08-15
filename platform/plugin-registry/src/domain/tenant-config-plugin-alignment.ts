import type { ConfigLayer } from '@ai-commerce/config-runtime';

import { PluginSettingsConflictException } from '../errors.js';
import type { PluginSettings } from '../types.js';
import { stableStringify } from '../types.js';

/** Tenant config plugin declaration entry shape. */
export interface TenantPluginConfigEntry {
  id: string;
  version: string;
  enabled: boolean;
  settings?: PluginSettings;
}

/** Find a matching integrations.plugins declaration for an install request. */
export function findPluginConfigEntry(
  tenantConfig: ConfigLayer,
  pluginId: string,
  version: string,
): TenantPluginConfigEntry | undefined {
  const plugins = tenantConfig.integrations?.plugins;

  if (!plugins) {
    return undefined;
  }

  return plugins.find(
    (entry): entry is TenantPluginConfigEntry => entry.id === pluginId && entry.version === version,
  );
}

/** Resolve effective install settings from input and tenant config declaration. */
export function resolveEffectiveSettings(
  tenantId: string,
  pluginId: string,
  inputSettings: PluginSettings | undefined,
  configSettings: PluginSettings | undefined,
): PluginSettings | undefined {
  const hasInput = inputSettings !== undefined;
  const hasConfig = configSettings !== undefined;

  if (hasInput && hasConfig && stableStringify(inputSettings) !== stableStringify(configSettings)) {
    throw new PluginSettingsConflictException(tenantId, pluginId);
  }

  if (hasConfig) {
    return configSettings;
  }

  if (hasInput) {
    return inputSettings;
  }

  return undefined;
}
