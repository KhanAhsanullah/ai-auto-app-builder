import type { ResolvedTenantIdentity } from '../types.js';

/** Lookup port for tenant identity by id or slug. */
export interface TenantDirectory {
  findById(id: string): Promise<ResolvedTenantIdentity | undefined>;
  findBySlug(slug: string): Promise<ResolvedTenantIdentity | undefined>;
}

export interface TenantResolverOptions {
  directory: TenantDirectory;
  /** Header names (lowercase). */
  tenantIdHeader?: string;
  tenantSlugHeader?: string;
  /**
   * When set, treat the left-most Host label as a tenant slug
   * (e.g. `acme.api.example.com` → `acme`) if it is not in `reservedSubdomains`.
   */
  enableSubdomainLookup?: boolean;
  reservedSubdomains?: readonly string[];
}

/**
 * Resolves tenant identity from gateway request headers / Host.
 * Order: x-tenant-id → x-tenant-slug → subdomain (optional).
 */
export class TenantResolver {
  private readonly tenantIdHeader: string;
  private readonly tenantSlugHeader: string;
  private readonly enableSubdomainLookup: boolean;
  private readonly reservedSubdomains: Set<string>;

  constructor(private readonly options: TenantResolverOptions) {
    this.tenantIdHeader = (options.tenantIdHeader ?? 'x-tenant-id').toLowerCase();
    this.tenantSlugHeader = (options.tenantSlugHeader ?? 'x-tenant-slug').toLowerCase();
    this.enableSubdomainLookup = options.enableSubdomainLookup ?? true;
    this.reservedSubdomains = new Set(
      (options.reservedSubdomains ?? ['www', 'api', 'admin', 'app', 'localhost']).map((value) =>
        value.toLowerCase(),
      ),
    );
  }

  /** Resolve tenant identity or return undefined when no identity hints are present. */
  async resolve(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<ResolvedTenantIdentity | undefined> {
    const id = this.headerValue(headers, this.tenantIdHeader);
    if (id) {
      const byId = await this.options.directory.findById(id);
      if (byId) {
        return byId;
      }
    }

    const slug = this.headerValue(headers, this.tenantSlugHeader);
    if (slug) {
      const bySlug = await this.options.directory.findBySlug(slug.toLowerCase());
      if (bySlug) {
        return bySlug;
      }
    }

    if (this.enableSubdomainLookup) {
      const host = this.headerValue(headers, 'host');
      const subdomain = host ? this.extractSubdomain(host) : undefined;
      if (subdomain) {
        return this.options.directory.findBySlug(subdomain);
      }
    }

    return undefined;
  }

  private headerValue(
    headers: Record<string, string | string[] | undefined>,
    name: string,
  ): string | undefined {
    const raw = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(raw)) {
      return raw[0]?.trim() || undefined;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  }

  private extractSubdomain(hostHeader: string): string | undefined {
    const host = hostHeader.split(':')[0]?.toLowerCase();
    if (!host || host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/u.test(host)) {
      return undefined;
    }

    const parts = host.split('.');
    if (parts.length < 3) {
      return undefined;
    }

    const subdomain = parts[0];
    if (!subdomain || this.reservedSubdomains.has(subdomain)) {
      return undefined;
    }

    return subdomain;
  }
}
