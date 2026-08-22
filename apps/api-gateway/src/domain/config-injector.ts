import type { ConfigLayer, ConfigProvider } from '@ai-commerce/config-runtime';

import { ConfigInjectionException } from '../errors.js';
import type { GatewayContext } from '../types.js';

/** Loads the tenant-layer config document for ConfigProvider.resolve. */
export interface TenantConfigLoader {
  loadTenantConfig(tenantId: string): Promise<ConfigLayer>;
}

export interface ConfigInjectorOptions {
  configProvider: ConfigProvider;
  configLoader: TenantConfigLoader;
}

/**
 * Injects resolved tenant configuration into the gateway context.
 * Uses Config Runtime as a validation/merge gate (no config writes).
 */
export class ConfigInjector {
  constructor(private readonly options: ConfigInjectorOptions) {}

  async inject(context: GatewayContext): Promise<GatewayContext> {
    if (!context.tenant) {
      throw new ConfigInjectionException('Cannot inject config without a resolved tenant.');
    }

    try {
      const tenantConfig = await this.options.configLoader.loadTenantConfig(context.tenant.id);
      const config = this.options.configProvider.resolve({
        tenantConfig,
        skipCache: true,
      });

      if (!config.validation.success) {
        throw new ConfigInjectionException(
          `Tenant config validation failed for '${context.tenant.id}'.`,
        );
      }

      return {
        ...context,
        config,
      };
    } catch (error) {
      if (error instanceof ConfigInjectionException) {
        throw error;
      }
      const detail = error instanceof Error ? error.message : String(error);
      throw new ConfigInjectionException(
        `Failed to inject config for tenant '${context.tenant.id}': ${detail}`,
      );
    }
  }
}
