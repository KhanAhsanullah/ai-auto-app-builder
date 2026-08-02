type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merge source into target. Later layers win for scalar values. */
export function deepMerge<T extends PlainObject>(target: T, source: PlainObject): T {
  if (!isPlainObject(source)) {
    return target;
  }

  const result: PlainObject = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    if (sourceValue === undefined) {
      continue;
    }

    const targetValue = result[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
      continue;
    }

    result[key] = sourceValue;
  }

  return result as T;
}

/** Shallow-merge top-level theme sections for environment overrides. */
export function shallowMergeThemeSections<T extends PlainObject>(
  target: T,
  source: PlainObject,
): T {
  const result: PlainObject = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    if (sourceValue === undefined) {
      continue;
    }

    const targetValue = result[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = { ...targetValue, ...sourceValue };
      continue;
    }

    result[key] = sourceValue;
  }

  return result as T;
}
