import type { ConfigEngine } from '@ai-commerce/config-engine';
import { ConfigDocumentNotFoundException } from '@ai-commerce/config-engine';
import type { ProvisioningResult } from '@ai-commerce/config-schema';
import type { TenantProvisioner, TenantRecord } from '@ai-commerce/tenant-provisioner';

import { PlatformApiException, TenantNotFoundException } from '../errors.js';
import type {
  BoomLaunchInput,
  BoomLaunchVertical,
  TenantCatalogResponse,
  TenantConfigResponse,
  TenantSummary,
} from '../types.js';
import { toProvisioningRequest } from './map-boom-launch.js';
import type { TenantCatalogRepository } from './tenant-catalog-repository.js';
import { buildVerticalCatalogRecord } from './vertical-catalog-seeds.js';

export interface PlatformApiDeps {
  provisioner: TenantProvisioner;
  configEngine: ConfigEngine;
  catalogRepository: TenantCatalogRepository;
  /** When true (default), activate the tenant after provision. */
  activateOnLaunch?: boolean;
  /** Clock for catalog timestamps (defaults to Date ISO). */
  now?: () => string;
}

/**
 * Control-plane facade — Boom launch provisions, activates, publishes config,
 * and seeds a vertical demo catalog.
 */
export class PlatformApi {
  private readonly activateOnLaunch: boolean;
  private readonly now: () => string;

  constructor(private readonly deps: PlatformApiDeps) {
    this.activateOnLaunch = deps.activateOnLaunch ?? true;
    this.now = deps.now ?? (() => new Date().toISOString());
  }

  /** Health probe for HTTP / process monitors. */
  health(): { ok: true; service: 'platform-api' } {
    return { ok: true, service: 'platform-api' };
  }

  /**
   * Boom launch: provision from wizard input, activate when configured,
   * ensure a published ConfigEngine revision, and seed the vertical catalog.
   * `created` reflects whether provision created a new registry row (not activation).
   */
  async launchBoom(input: BoomLaunchInput): Promise<ProvisioningResult> {
    const request = toProvisioningRequest(input);
    const provisioned = await this.deps.provisioner.provision(request);
    let result: ProvisioningResult = provisioned;

    if (this.activateOnLaunch && provisioned.status !== 'active') {
      const activated = await this.deps.provisioner.activate({ tenantId: provisioned.tenantId });
      result = {
        ...activated,
        created: provisioned.created,
      };
    }

    await this.ensurePublishedConfig(result.tenantId);
    await this.ensureCatalogSeeded(result.tenantId, input.vertical);
    return result;
  }

  /** List provisioned tenant summaries. */
  async listTenants(): Promise<{ tenants: TenantSummary[] }> {
    const records = await this.deps.provisioner.list();
    const tenants = records
      .map((record) => toTenantSummary(record))
      .sort((a, b) => a.slug.localeCompare(b.slug));
    return { tenants };
  }

  /** Fetch a provisioned tenant summary by id. */
  async getTenant(tenantId: string): Promise<TenantSummary> {
    const record = await this.requireTenant(tenantId);
    return toTenantSummary(record);
  }

  /**
   * Fetch tenant config — prefers latest published ConfigEngine revision,
   * falls back to the registry document when nothing is published yet.
   */
  async getTenantConfig(tenantId: string): Promise<TenantConfigResponse> {
    const record = await this.requireTenant(tenantId);
    try {
      const published = await this.deps.configEngine.getLatestPublished(record.tenantId);
      return {
        tenantId: record.tenantId,
        slug: record.slug,
        status: record.status,
        updatedAt: published.updatedAt,
        document: published.document as TenantConfigResponse['document'],
        configVersion: published.version,
        publishId: published.publishId,
      };
    } catch (err: unknown) {
      if (!(err instanceof ConfigDocumentNotFoundException)) {
        throw err;
      }
    }

    return {
      tenantId: record.tenantId,
      slug: record.slug,
      status: record.status,
      updatedAt: record.updatedAt,
      document: record.configDocument as TenantConfigResponse['document'],
    };
  }

  /** Fetch the platform-owned catalog products for a tenant. */
  async getTenantCatalog(tenantId: string): Promise<TenantCatalogResponse> {
    const record = await this.requireTenant(tenantId);
    const catalog = await this.deps.catalogRepository.findByTenantId(record.tenantId);
    if (!catalog) {
      throw new PlatformApiException(`No catalog found for tenant '${record.tenantId}'.`, 404);
    }
    return {
      tenantId: catalog.tenantId,
      vertical: catalog.vertical,
      updatedAt: catalog.updatedAt,
      products: catalog.products,
    };
  }

  private async ensurePublishedConfig(tenantId: string): Promise<void> {
    try {
      await this.deps.configEngine.getLatestPublished(tenantId);
      return;
    } catch (err: unknown) {
      if (!(err instanceof ConfigDocumentNotFoundException)) {
        throw err;
      }
    }

    const record = await this.deps.provisioner.findById(tenantId);
    if (!record) {
      throw new TenantNotFoundException(tenantId);
    }

    await this.deps.configEngine.saveDraft({
      tenantId,
      document: record.configDocument,
    });
    await this.deps.configEngine.publish({
      tenantId,
      surfaces: ['web', 'mobile'],
    });
  }

  private async ensureCatalogSeeded(tenantId: string, vertical: BoomLaunchVertical): Promise<void> {
    const existing = await this.deps.catalogRepository.findByTenantId(tenantId);
    if (existing && existing.products.length > 0) {
      return;
    }
    const record = buildVerticalCatalogRecord({
      tenantId,
      vertical,
      updatedAt: this.now(),
    });
    await this.deps.catalogRepository.save(record);
  }

  private async requireTenant(tenantId: string): Promise<TenantRecord> {
    const id = tenantId.trim();
    if (!id) {
      throw new PlatformApiException('tenantId is required.', 400);
    }
    const record = await this.deps.provisioner.findById(id);
    if (!record) {
      throw new TenantNotFoundException(id);
    }
    return record;
  }
}

function toTenantSummary(record: TenantRecord): TenantSummary {
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
