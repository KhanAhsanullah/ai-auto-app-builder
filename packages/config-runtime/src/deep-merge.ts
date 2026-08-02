import type { ConfigLayer } from './types.js';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge source into target. Arrays and non-plain objects from source
 * replace target values. Later layers win for scalar values.
 */
export function deepMerge<T extends ConfigLayer>(target: T, source: ConfigLayer): T {
  if (!isPlainObject(source)) {
    return target;
  }

  const result: Record<string, unknown> = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    if (sourceValue === undefined) {
      continue;
    }

    const targetValue = result[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(targetValue as ConfigLayer, sourceValue as ConfigLayer);
      continue;
    }

    result[key] = sourceValue;
  }

  return result as T;
}

/**
 * Shallow-merge environment overrides into a resolved configuration.
 * Top-level section keys are merged one level deep; nested objects are not
 * recursively merged beyond the first level.
 */
export function shallowMergeSections(target: ConfigLayer, overrides: ConfigLayer): ConfigLayer {
  const result: Record<string, unknown> = { ...target };

  for (const [key, overrideValue] of Object.entries(overrides)) {
    if (overrideValue === undefined) {
      continue;
    }

    const targetValue = result[key];

    if (isPlainObject(targetValue) && isPlainObject(overrideValue)) {
      result[key] = { ...targetValue, ...overrideValue };
      continue;
    }

    result[key] = overrideValue;
  }

  return result as ConfigLayer;
}

/**
 * Recursively freeze an object graph to enforce immutability.
 */
export function deepFreeze<T>(value: T): Readonly<T> {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return value as Readonly<T>;
  }

  Object.freeze(value);

  for (const nested of Object.values(value)) {
    if (isPlainObject(nested) || Array.isArray(nested)) {
      deepFreeze(nested);
    }
  }

  return value as Readonly<T>;
}
