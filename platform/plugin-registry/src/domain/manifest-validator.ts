import { pluginManifestSchema, type PluginManifest } from '@ai-commerce/config-schema';
import semver from 'semver';

import { PLUGIN_ENGINE_API_VERSION } from '../constants.js';
import { PluginManifestValidationException } from '../errors.js';
import type { ValidatedPluginManifest } from '../types.js';
import { isKnownHookPoint } from './hook-point-catalog.js';

const HANDLER_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

/** Validates plugin manifest schema and semantic registration rules. */
export class ManifestValidator {
  /** Validate and normalize a plugin manifest document. */
  validate(input: unknown): ValidatedPluginManifest {
    const parsed = pluginManifestSchema.safeParse(input);

    if (!parsed.success) {
      throw new PluginManifestValidationException(
        `Plugin manifest schema validation failed: ${parsed.error.message}`,
      );
    }

    const manifest = parsed.data as PluginManifest;
    this.validateSemanticRules(manifest);

    return manifest;
  }

  private validateSemanticRules(manifest: PluginManifest): void {
    if (!semver.valid(manifest.version)) {
      throw new PluginManifestValidationException(
        `Plugin version '${manifest.version}' is not a valid semver string.`,
      );
    }

    if (!semver.validRange(manifest.engineVersion)) {
      throw new PluginManifestValidationException(
        `Engine version range '${manifest.engineVersion}' is not a valid semver range.`,
      );
    }

    if (!semver.satisfies(PLUGIN_ENGINE_API_VERSION, manifest.engineVersion)) {
      throw new PluginManifestValidationException(
        `Engine version range '${manifest.engineVersion}' is not compatible with platform API version '${PLUGIN_ENGINE_API_VERSION}'.`,
      );
    }

    this.validatePermissions(manifest.permissions);
    this.validateHooks(manifest.hooks);
    this.validateDependencies(manifest.dependencies);
    this.validateConfigSchema(manifest.configSchema);
  }

  private validatePermissions(permissions: string[]): void {
    const seen = new Set<string>();

    for (const permission of permissions) {
      if (seen.has(permission)) {
        throw new PluginManifestValidationException(`Duplicate permission entry '${permission}'.`);
      }

      seen.add(permission);
    }
  }

  private validateHooks(hooks: PluginManifest['hooks']): void {
    const seen = new Set<string>();

    for (const hook of hooks) {
      if (typeof hook.point !== 'string' || typeof hook.handler !== 'string') {
        throw new PluginManifestValidationException(
          'Each hook registration must include point and handler strings.',
        );
      }

      if (!isKnownHookPoint(hook.point)) {
        throw new PluginManifestValidationException(`Unknown hook point '${hook.point}'.`);
      }

      if (!HANDLER_PATTERN.test(hook.handler)) {
        throw new PluginManifestValidationException(
          `Hook handler '${hook.handler}' has an invalid identifier pattern.`,
        );
      }

      if (hook.priority !== undefined && (!Number.isInteger(hook.priority) || hook.priority < 0)) {
        throw new PluginManifestValidationException(
          `Hook priority for '${hook.point}' must be a non-negative integer.`,
        );
      }

      const key = `${hook.point}::${hook.handler}`;

      if (seen.has(key)) {
        throw new PluginManifestValidationException(
          `Duplicate hook registration for point '${hook.point}' and handler '${hook.handler}'.`,
        );
      }

      seen.add(key);
    }
  }

  private validateDependencies(dependencies: PluginManifest['dependencies']): void {
    if (!dependencies) {
      return;
    }

    for (const dependency of dependencies) {
      if (!semver.validRange(dependency.versionRange)) {
        throw new PluginManifestValidationException(
          `Dependency version range '${dependency.versionRange}' for '${dependency.id}' is not a valid semver range.`,
        );
      }
    }
  }

  private validateConfigSchema(configSchema: PluginManifest['configSchema']): void {
    if (configSchema === undefined) {
      return;
    }

    if (typeof configSchema !== 'object' || configSchema === null || Array.isArray(configSchema)) {
      throw new PluginManifestValidationException(
        'configSchema must be a JSON Schema object when provided.',
      );
    }

    if ((configSchema as Record<string, unknown>).type !== 'object') {
      throw new PluginManifestValidationException(
        'configSchema must declare type "object" when provided.',
      );
    }
  }
}
