import type { ResolvedTenantIdentity } from '../types.js';
import type { TenantDirectory } from '../domain/tenant-resolver.js';

/** In-memory tenant directory for tests and local development. */
export class InMemoryTenantDirectory implements TenantDirectory {
  private readonly byId = new Map<string, ResolvedTenantIdentity>();
  private readonly bySlug = new Map<string, ResolvedTenantIdentity>();

  seed(tenants: readonly ResolvedTenantIdentity[]): void {
    for (const tenant of tenants) {
      this.byId.set(tenant.id, tenant);
      this.bySlug.set(tenant.slug.toLowerCase(), tenant);
    }
  }

  async findById(id: string): Promise<ResolvedTenantIdentity | undefined> {
    return this.byId.get(id);
  }

  async findBySlug(slug: string): Promise<ResolvedTenantIdentity | undefined> {
    return this.bySlug.get(slug.toLowerCase());
  }
}
