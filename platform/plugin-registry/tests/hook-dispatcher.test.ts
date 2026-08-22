import { describe, expect, it } from 'vitest';

import { HookDispatcher } from '../src/domain/hook-dispatcher.js';
import { PluginHandlerRegistry } from '../src/domain/plugin-handler-registry.js';
import { InMemoryTenantHandlerActivationStore } from '../src/infrastructure/in-memory-tenant-handler-activation-store.js';
import { PluginHandlerDispatchException, UnknownHookPointException } from '../src/errors.js';
import type { TenantHandlerActivation } from '../src/types.js';
import { TENANT_ID } from './helpers.js';

function activation(
  overrides: Partial<TenantHandlerActivation> &
    Pick<TenantHandlerActivation, 'pluginId' | 'handlerId' | 'hookPoint'>,
): TenantHandlerActivation {
  return {
    tenantId: TENANT_ID,
    version: '1.0.0',
    priority: 100,
    permissions: ['theme.read'],
    ...overrides,
  };
}

describe('HookDispatcher', () => {
  it('returns empty result when no activations exist', async () => {
    const dispatcher = new HookDispatcher({
      handlerRegistry: new PluginHandlerRegistry(),
      activationStore: new InMemoryTenantHandlerActivationStore(),
    });

    const result = await dispatcher.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.resolve.after',
      context: { value: 1 },
    });

    expect(result.invoked).toBe(0);
    expect(result.outcomes).toEqual([]);
  });

  it('rejects unknown hook points', async () => {
    const dispatcher = new HookDispatcher({
      handlerRegistry: new PluginHandlerRegistry(),
      activationStore: new InMemoryTenantHandlerActivationStore(),
    });

    await expect(
      dispatcher.dispatch({
        tenantId: TENANT_ID,
        hookPoint: 'unknown.hook.point',
        context: {},
      }),
    ).rejects.toThrow(UnknownHookPointException);
  });

  it('invokes handlers in priority then pluginId then handlerId order', async () => {
    const handlerRegistry = new PluginHandlerRegistry();
    const activationStore = new InMemoryTenantHandlerActivationStore();
    const order: string[] = [];

    for (const [pluginId, handlerId] of [
      ['com.commerceos.z', 'late'],
      ['com.commerceos.a', 'second'],
      ['com.commerceos.a', 'first'],
      ['com.commerceos.b', 'mid'],
    ] as const) {
      handlerRegistry.register({
        pluginId,
        handlerId,
        handler: () => {
          order.push(`${pluginId}:${handlerId}`);
        },
      });
    }

    await activationStore.replaceForPlugin(TENANT_ID, 'com.commerceos.z', [
      activation({
        pluginId: 'com.commerceos.z',
        handlerId: 'late',
        hookPoint: 'theme.resolve.after',
        priority: 200,
      }),
    ]);
    await activationStore.replaceForPlugin(TENANT_ID, 'com.commerceos.a', [
      activation({
        pluginId: 'com.commerceos.a',
        handlerId: 'second',
        hookPoint: 'theme.resolve.after',
        priority: 50,
      }),
      activation({
        pluginId: 'com.commerceos.a',
        handlerId: 'first',
        hookPoint: 'theme.resolve.after',
        priority: 50,
      }),
    ]);
    await activationStore.replaceForPlugin(TENANT_ID, 'com.commerceos.b', [
      activation({
        pluginId: 'com.commerceos.b',
        handlerId: 'mid',
        hookPoint: 'theme.resolve.after',
        priority: 100,
      }),
    ]);

    const dispatcher = new HookDispatcher({ handlerRegistry, activationStore });
    await dispatcher.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.resolve.after',
      context: {},
    });

    expect(order).toEqual([
      'com.commerceos.a:first',
      'com.commerceos.a:second',
      'com.commerceos.b:mid',
      'com.commerceos.z:late',
    ]);
  });

  it('isolates dispatch by tenantId', async () => {
    const handlerRegistry = new PluginHandlerRegistry();
    const activationStore = new InMemoryTenantHandlerActivationStore();
    const calls: string[] = [];

    handlerRegistry.register({
      pluginId: 'com.example.plugin',
      handlerId: 'onHook',
      handler: (invocation) => {
        calls.push(invocation.tenantId);
      },
    });

    await activationStore.replaceForPlugin(TENANT_ID, 'com.example.plugin', [
      activation({
        pluginId: 'com.example.plugin',
        handlerId: 'onHook',
        hookPoint: 'config.validate.after',
      }),
    ]);
    await activationStore.replaceForPlugin('other-tenant', 'com.example.plugin', [
      activation({
        tenantId: 'other-tenant',
        pluginId: 'com.example.plugin',
        handlerId: 'onHook',
        hookPoint: 'config.validate.after',
      }),
    ]);

    const dispatcher = new HookDispatcher({ handlerRegistry, activationStore });
    await dispatcher.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'config.validate.after',
      context: {},
    });

    expect(calls).toEqual([TENANT_ID]);
  });

  it('fails fast and includes prior successful outcomes', async () => {
    const handlerRegistry = new PluginHandlerRegistry();
    const activationStore = new InMemoryTenantHandlerActivationStore();

    handlerRegistry.register({
      pluginId: 'com.example.a',
      handlerId: 'ok',
      handler: () => undefined,
    });
    handlerRegistry.register({
      pluginId: 'com.example.b',
      handlerId: 'boom',
      handler: () => {
        throw new Error('handler exploded');
      },
    });

    await activationStore.replaceForPlugin(TENANT_ID, 'com.example.a', [
      activation({
        pluginId: 'com.example.a',
        handlerId: 'ok',
        hookPoint: 'tenant.provision.after',
        priority: 10,
      }),
    ]);
    await activationStore.replaceForPlugin(TENANT_ID, 'com.example.b', [
      activation({
        pluginId: 'com.example.b',
        handlerId: 'boom',
        hookPoint: 'tenant.provision.after',
        priority: 20,
      }),
    ]);

    const dispatcher = new HookDispatcher({ handlerRegistry, activationStore });

    await expect(
      dispatcher.dispatch({
        tenantId: TENANT_ID,
        hookPoint: 'tenant.provision.after',
        context: {},
      }),
    ).rejects.toMatchObject({
      name: 'PluginHandlerDispatchException',
      pluginId: 'com.example.b',
      handlerId: 'boom',
      outcomes: [
        { pluginId: 'com.example.a', handlerId: 'ok', success: true },
        {
          pluginId: 'com.example.b',
          handlerId: 'boom',
          success: false,
          error: 'handler exploded',
        },
      ],
    });

    await expect(
      dispatcher.dispatch({
        tenantId: TENANT_ID,
        hookPoint: 'tenant.provision.after',
        context: {},
      }),
    ).rejects.toThrow(PluginHandlerDispatchException);
  });

  it('awaits async handlers sequentially', async () => {
    const handlerRegistry = new PluginHandlerRegistry();
    const activationStore = new InMemoryTenantHandlerActivationStore();
    const order: string[] = [];

    handlerRegistry.register({
      pluginId: 'com.example.a',
      handlerId: 'slow',
      handler: async () => {
        await Promise.resolve();
        order.push('a');
      },
    });
    handlerRegistry.register({
      pluginId: 'com.example.b',
      handlerId: 'next',
      handler: () => {
        order.push('b');
      },
    });

    await activationStore.replaceForPlugin(TENANT_ID, 'com.example.a', [
      activation({
        pluginId: 'com.example.a',
        handlerId: 'slow',
        hookPoint: 'theme.presets.extend',
        priority: 1,
      }),
    ]);
    await activationStore.replaceForPlugin(TENANT_ID, 'com.example.b', [
      activation({
        pluginId: 'com.example.b',
        handlerId: 'next',
        hookPoint: 'theme.presets.extend',
        priority: 2,
      }),
    ]);

    const dispatcher = new HookDispatcher({ handlerRegistry, activationStore });
    const result = await dispatcher.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.presets.extend',
      context: { presets: [] },
    });

    expect(order).toEqual(['a', 'b']);
    expect(result.invoked).toBe(2);
  });

  it('passes permissions metadata without enforcing them', async () => {
    const handlerRegistry = new PluginHandlerRegistry();
    const activationStore = new InMemoryTenantHandlerActivationStore();
    let seenPermissions: readonly string[] = [];

    handlerRegistry.register({
      pluginId: 'com.example.plugin',
      handlerId: 'onHook',
      handler: (invocation) => {
        seenPermissions = invocation.permissions;
      },
    });

    await activationStore.replaceForPlugin(TENANT_ID, 'com.example.plugin', [
      activation({
        pluginId: 'com.example.plugin',
        handlerId: 'onHook',
        hookPoint: 'theme.presets.extend',
        permissions: ['theme.read', 'theme.write'],
      }),
    ]);

    const dispatcher = new HookDispatcher({ handlerRegistry, activationStore });
    await dispatcher.dispatch({
      tenantId: TENANT_ID,
      hookPoint: 'theme.presets.extend',
      context: {},
    });

    expect(seenPermissions).toEqual(['theme.read', 'theme.write']);
  });
});
