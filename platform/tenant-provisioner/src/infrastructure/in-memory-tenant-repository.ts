import {
  TenantAlreadyExistsException,
  TenantNotFoundException,
  TenantProvisioningException,
} from '../errors.js';
import type { TenantRepository } from '../domain/tenant-repository.js';
import type { TenantRecord } from '../types.js';

/** In-memory tenant registry backed by Map indexes. */
export class InMemoryTenantRepository implements TenantRepository {
  private readonly byId = new Map<string, TenantRecord>();
  private readonly bySlug = new Map<string, TenantRecord>();

  async findById(tenantId: string): Promise<TenantRecord | undefined> {
    return this.byId.get(tenantId);
  }

  async findBySlug(slug: string): Promise<TenantRecord | undefined> {
    return this.bySlug.get(slug);
  }

  async save(record: TenantRecord): Promise<void> {
    if (this.byId.has(record.tenantId)) {
      throw new TenantAlreadyExistsException(
        `Tenant already exists with id '${record.tenantId}'.`,
        { tenantId: record.tenantId },
      );
    }

    if (this.bySlug.has(record.slug)) {
      throw new TenantAlreadyExistsException(`Tenant already exists with slug '${record.slug}'.`, {
        slug: record.slug,
      });
    }

    this.byId.set(record.tenantId, record);
    this.bySlug.set(record.slug, record);
  }

  async update(record: TenantRecord): Promise<void> {
    const existing = this.byId.get(record.tenantId);

    if (!existing) {
      throw new TenantNotFoundException(record.tenantId);
    }

    if (existing.tenantId !== record.tenantId || existing.slug !== record.slug) {
      throw new TenantProvisioningException('Tenant id and slug are immutable.');
    }

    this.byId.set(record.tenantId, record);
    this.bySlug.set(record.slug, record);
  }
}
