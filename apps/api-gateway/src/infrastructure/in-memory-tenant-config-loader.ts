import type { ConfigLayer } from '@ai-commerce/config-runtime';

import { ConfigInjectionException } from '../errors.js';
import type { TenantConfigLoader } from '../domain/config-injector.js';

/** In-memory tenant config loader keyed by tenant id. */
export class InMemoryTenantConfigLoader implements TenantConfigLoader {
  private readonly byTenantId = new Map<string, ConfigLayer>();

  seed(tenantId: string, config: ConfigLayer): void {
    this.byTenantId.set(tenantId, config);
  }

  async loadTenantConfig(tenantId: string): Promise<ConfigLayer> {
    const config = this.byTenantId.get(tenantId);
    if (!config) {
      throw new ConfigInjectionException(`No tenant config registered for '${tenantId}'.`);
    }
    return config;
  }
}
