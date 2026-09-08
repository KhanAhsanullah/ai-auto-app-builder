import type { ProvisioningResult } from '@ai-commerce/config-schema';
import type { TenantProvisioner } from '@ai-commerce/tenant-provisioner';

import { PlatformApiException, TenantNotFoundException } from '../errors.js';
import type { BoomLaunchInput } from '../types.js';
import { toProvisioningRequest } from './map-boom-launch.js';

export interface PlatformApiDeps {
  provisioner: TenantProvisioner;
  /** When true (default), activate the tenant after provision. */
  activateOnLaunch?: boolean;
}

/**
 * Control-plane facade — Boom launch provisions (and optionally activates) a tenant.
 */
export class PlatformApi {
  private readonly activateOnLaunch: boolean;

  constructor(private readonly deps: PlatformApiDeps) {
    this.activateOnLaunch = deps.activateOnLaunch ?? true;
  }

  /** Health probe for HTTP / process monitors. */
  health(): { ok: true; service: 'platform-api' } {
    return { ok: true, service: 'platform-api' };
  }

  /**
   * Boom launch: provision from wizard input, then activate when configured.
   * `created` reflects whether provision created a new registry row (not activation).
   */
  async launchBoom(input: BoomLaunchInput): Promise<ProvisioningResult> {
    const request = toProvisioningRequest(input);
    const provisioned = await this.deps.provisioner.provision(request);
    if (!this.activateOnLaunch || provisioned.status === 'active') {
      return provisioned;
    }
    const activated = await this.deps.provisioner.activate({ tenantId: provisioned.tenantId });
    return {
      ...activated,
      created: provisioned.created,
    };
  }

  /** Fetch a provisioned tenant summary by id. */
  async getTenant(tenantId: string): Promise<{
    tenantId: string;
    slug: string;
    status: string;
    vertical: string;
    name: string;
  }> {
    const id = tenantId.trim();
    if (!id) {
      throw new PlatformApiException('tenantId is required.', 400);
    }
    const record = await this.deps.provisioner.findById(id);
    if (!record) {
      throw new TenantNotFoundException(id);
    }
    const name =
      typeof record.configDocument.tenant?.name === 'string'
        ? record.configDocument.tenant.name
        : record.slug;
    const vertical =
      typeof record.configDocument.tenant?.vertical === 'string'
        ? record.configDocument.tenant.vertical
        : 'ecommerce';
    return {
      tenantId: record.tenantId,
      slug: record.slug,
      status: record.status,
      vertical,
      name,
    };
  }
}
