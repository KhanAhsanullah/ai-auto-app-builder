import type { PluginManifest } from '@ai-commerce/config-schema';

export const VALID_PLUGIN_MANIFEST: PluginManifest = {
  id: 'com.commerceos.theme.contrast',
  name: 'Contrast Theme Extension',
  description: 'Adds high-contrast preset extensions.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: ['theme.read'],
  hooks: [
    {
      point: 'theme.presets.extend',
      handler: 'extendPresets',
      priority: 100,
    },
    {
      point: 'theme.resolve.after',
      handler: 'adjustResolvedTheme',
    },
  ],
  dependencies: [],
  configSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      contrastLevel: {
        type: 'string',
        enum: ['normal', 'high'],
      },
    },
  },
};

export const VALID_PLUGIN_MANIFEST_V2: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  version: '2.0.0',
  description: 'Second major release of the contrast theme extension.',
};

export const INVALID_PLUGIN_MANIFEST_UNKNOWN_HOOK: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  hooks: [{ point: 'unknown.hook.point', handler: 'noop' }],
};

export const INVALID_PLUGIN_MANIFEST_DUPLICATE_HOOK: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  hooks: [
    { point: 'theme.presets.extend', handler: 'extendPresets' },
    { point: 'theme.presets.extend', handler: 'extendPresets' },
  ],
};

export const INVALID_PLUGIN_MANIFEST_BAD_ENGINE_RANGE: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  engineVersion: 'not-a-range',
};

export const INVALID_PLUGIN_MANIFEST_INCOMPATIBLE_ENGINE: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  engineVersion: '^6.0.0',
};

export const INVALID_PLUGIN_MANIFEST_BAD_DEPENDENCY_RANGE: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  dependencies: [{ id: 'com.commerceos.other', versionRange: 'latest' }],
};

export const INVALID_PLUGIN_MANIFEST_INVALID_CONFIG_SCHEMA: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  configSchema: {
    type: 'string',
  },
};

export const INVALID_PLUGIN_MANIFEST_DUPLICATE_PERMISSION: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  permissions: ['theme.read', 'theme.read'],
};

export const INVALID_PLUGIN_MANIFEST_BAD_ID: PluginManifest = {
  ...VALID_PLUGIN_MANIFEST,
  id: 'InvalidPluginId',
};
