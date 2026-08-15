import AjvModule from 'ajv';

import type { PluginManifest } from '@ai-commerce/config-schema';

import { PluginSettingsValidationException } from '../errors.js';

const Ajv = AjvModule.default ?? AjvModule;

/** Validates plugin settings against an embedded manifest configSchema using AJV. */
export class PluginSettingsValidator {
  private readonly ajv = new Ajv({ allErrors: true, strict: false });

  /** Validate settings when manifest configSchema is present; no-op otherwise. */
  validate(manifest: PluginManifest, settings: unknown): void {
    if (manifest.configSchema === undefined) {
      return;
    }

    if (settings === undefined) {
      throw new PluginSettingsValidationException(
        `Plugin '${manifest.id}' requires settings validated by configSchema.`,
      );
    }

    const validate = this.ajv.compile(manifest.configSchema as Record<string, unknown>);
    const valid = validate(settings);

    if (!valid) {
      const details =
        validate.errors
          ?.map((error: { message?: string }) => error.message ?? 'invalid')
          .join('; ') ?? 'invalid';
      throw new PluginSettingsValidationException(
        `Plugin settings validation failed for '${manifest.id}': ${details}.`,
      );
    }
  }
}
