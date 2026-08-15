import { describe, expect, it } from 'vitest';

import { ManifestValidator } from '../src/domain/manifest-validator.js';
import { PluginManifestValidationException } from '../src/errors.js';
import {
  INVALID_PLUGIN_MANIFEST_BAD_DEPENDENCY_RANGE,
  INVALID_PLUGIN_MANIFEST_BAD_ENGINE_RANGE,
  INVALID_PLUGIN_MANIFEST_BAD_ID,
  INVALID_PLUGIN_MANIFEST_DUPLICATE_HOOK,
  INVALID_PLUGIN_MANIFEST_DUPLICATE_PERMISSION,
  INVALID_PLUGIN_MANIFEST_INCOMPATIBLE_ENGINE,
  INVALID_PLUGIN_MANIFEST_INVALID_CONFIG_SCHEMA,
  INVALID_PLUGIN_MANIFEST_UNKNOWN_HOOK,
  VALID_PLUGIN_MANIFEST,
} from './helpers.js';

describe('ManifestValidator', () => {
  const validator = new ManifestValidator();

  it('accepts a valid plugin manifest', () => {
    const result = validator.validate(VALID_PLUGIN_MANIFEST);

    expect(result.id).toBe(VALID_PLUGIN_MANIFEST.id);
    expect(result.version).toBe('1.0.0');
  });

  it('rejects invalid plugin id patterns from schema validation', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_BAD_ID)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects unknown hook points', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_UNKNOWN_HOOK)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects duplicate hook point and handler pairs', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_DUPLICATE_HOOK)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects invalid engineVersion range syntax', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_BAD_ENGINE_RANGE)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects engineVersion ranges incompatible with the platform API version', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_INCOMPATIBLE_ENGINE)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects invalid dependency version ranges', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_BAD_DEPENDENCY_RANGE)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects configSchema objects without type object', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_INVALID_CONFIG_SCHEMA)).toThrow(
      PluginManifestValidationException,
    );
  });

  it('rejects duplicate permission entries', () => {
    expect(() => validator.validate(INVALID_PLUGIN_MANIFEST_DUPLICATE_PERMISSION)).toThrow(
      PluginManifestValidationException,
    );
  });
});
