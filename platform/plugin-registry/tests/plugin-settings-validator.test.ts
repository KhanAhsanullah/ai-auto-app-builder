import { describe, expect, it } from 'vitest';

import { PluginSettingsValidator } from '../src/domain/plugin-settings-validator.js';
import { PluginSettingsValidationException } from '../src/errors.js';
import { PLUGIN_MANIFEST_NO_CONFIG_SCHEMA, VALID_PLUGIN_MANIFEST } from './helpers.js';

describe('PluginSettingsValidator', () => {
  const validator = new PluginSettingsValidator();

  it('accepts valid settings against configSchema', () => {
    expect(() =>
      validator.validate(VALID_PLUGIN_MANIFEST, { contrastLevel: 'high' }),
    ).not.toThrow();
  });

  it('throws when settings violate configSchema enum values', () => {
    expect(() => validator.validate(VALID_PLUGIN_MANIFEST, { contrastLevel: 'invalid' })).toThrow(
      PluginSettingsValidationException,
    );
  });

  it('throws when configSchema exists but settings are omitted', () => {
    expect(() => validator.validate(VALID_PLUGIN_MANIFEST, undefined)).toThrow(
      PluginSettingsValidationException,
    );
  });

  it('skips validation when manifest has no configSchema', () => {
    expect(() => validator.validate(PLUGIN_MANIFEST_NO_CONFIG_SCHEMA, undefined)).not.toThrow();
  });
});
