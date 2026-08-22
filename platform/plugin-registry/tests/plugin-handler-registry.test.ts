import { describe, expect, it } from 'vitest';

import { PluginHandlerRegistry } from '../src/domain/plugin-handler-registry.js';
import { PluginHandlerNotRegisteredException, PluginRegistryException } from '../src/errors.js';

describe('PluginHandlerRegistry', () => {
  it('registers and resolves a handler', () => {
    const registry = new PluginHandlerRegistry();
    const handler = () => undefined;

    registry.register({
      pluginId: 'com.example.plugin',
      handlerId: 'onHook',
      handler,
    });

    expect(registry.has('com.example.plugin', 'onHook')).toBe(true);
    expect(registry.get('com.example.plugin', 'onHook')).toBe(handler);
  });

  it('rejects duplicate handler registration', () => {
    const registry = new PluginHandlerRegistry();
    registry.register({
      pluginId: 'com.example.plugin',
      handlerId: 'onHook',
      handler: () => undefined,
    });

    expect(() =>
      registry.register({
        pluginId: 'com.example.plugin',
        handlerId: 'onHook',
        handler: () => undefined,
      }),
    ).toThrow(PluginRegistryException);
  });

  it('throws when resolving a missing handler', () => {
    const registry = new PluginHandlerRegistry();

    expect(() => registry.get('com.example.plugin', 'missing')).toThrow(
      PluginHandlerNotRegisteredException,
    );
  });

  it('unregisters handlers and lists remaining keys', () => {
    const registry = new PluginHandlerRegistry();
    registry.register({
      pluginId: 'com.example.a',
      handlerId: 'h1',
      handler: () => undefined,
    });
    registry.register({
      pluginId: 'com.example.b',
      handlerId: 'h2',
      handler: () => undefined,
    });

    expect(registry.unregister('com.example.a', 'h1')).toBe(true);
    expect(registry.has('com.example.a', 'h1')).toBe(false);
    expect(registry.list()).toEqual(['com.example.b:h2']);
  });

  it('returns false when unregistering an unknown handler', () => {
    const registry = new PluginHandlerRegistry();
    expect(registry.unregister('com.example.plugin', 'missing')).toBe(false);
  });
});
