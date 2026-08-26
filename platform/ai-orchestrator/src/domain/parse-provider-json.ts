import { AiProviderResponseException } from '../errors.js';

/**
 * Normalize provider output into a plain object.
 * Accepts already-parsed objects or JSON strings (some SDK stubs return text).
 */
export function parseProviderJson(raw: unknown): Record<string, unknown> {
  let value = raw;

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      throw new AiProviderResponseException('Provider returned a non-JSON string.');
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AiProviderResponseException('Provider JSON must be a non-null object.');
  }

  return value as Record<string, unknown>;
}
