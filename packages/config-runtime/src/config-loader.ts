import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import { ConfigLoadException } from './errors.js';
import type { LoadConfigOptions } from './types.js';

/** Loads configuration from JSON strings, objects, or files. */
export class ConfigLoader {
  /** Parse a JSON string into a configuration object. */
  parseJson<T = Record<string, unknown>>(json: string, options?: LoadConfigOptions): T {
    try {
      const parsed: unknown = JSON.parse(json);
      this.assertObjectRoot(parsed, options);
      return parsed as T;
    } catch (error) {
      if (error instanceof ConfigLoadException) {
        throw error;
      }

      throw new ConfigLoadException(
        `Failed to parse configuration JSON: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  /** Accept an already-parsed JSON object as configuration input. */
  loadJson<T = Record<string, unknown>>(
    value: Record<string, unknown>,
    options?: LoadConfigOptions,
  ): T {
    this.assertObjectRoot(value, options);
    return value as T;
  }

  /** Load and parse configuration JSON from a file asynchronously. */
  async loadFromFile<T = Record<string, unknown>>(
    filePath: string,
    options?: LoadConfigOptions,
  ): Promise<T> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return this.parseJson<T>(content, options);
    } catch (error) {
      if (error instanceof ConfigLoadException) {
        throw error;
      }

      throw new ConfigLoadException(
        `Failed to load configuration from file "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  /** Load and parse configuration JSON from a file synchronously. */
  loadFromFileSync<T = Record<string, unknown>>(filePath: string, options?: LoadConfigOptions): T {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.parseJson<T>(content, options);
    } catch (error) {
      if (error instanceof ConfigLoadException) {
        throw error;
      }

      throw new ConfigLoadException(
        `Failed to load configuration from file "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  private assertObjectRoot(value: unknown, options?: LoadConfigOptions): void {
    if (options?.requireObject === false) {
      return;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ConfigLoadException('Configuration JSON root must be an object.');
    }
  }
}
