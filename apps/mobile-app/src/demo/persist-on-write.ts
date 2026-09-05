/**
 * Wrap a repository so write methods (`save*` / `update*`) flush a snapshot after success.
 */
export function persistOnWrite<T extends object>(repository: T, persist: () => Promise<void>): T {
  return new Proxy(repository, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') {
        return value;
      }
      const name = String(prop);
      const isWrite = name.startsWith('save') || name.startsWith('update');
      if (!isWrite) {
        return value.bind(target);
      }
      return async (...args: unknown[]) => {
        const result = await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
        await persist();
        return result;
      };
    },
  });
}
