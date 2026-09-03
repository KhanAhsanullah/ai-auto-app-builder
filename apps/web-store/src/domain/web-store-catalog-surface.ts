import type {
  CatalogModule,
  ListProductsOptions,
  Product,
  SearchProductsOptions,
} from '@ai-commerce/module-catalog';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { WebStoreCatalogUnavailableException } from '../errors.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreCatalogBinding {
  catalog: CatalogModule;
}

/**
 * Storefront catalog access: feature-flag gated + tenant-scoped.
 * Screens / hosts call these methods instead of the catalog module directly.
 */
export class WebStoreCatalogSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedWebStoreShell,
    private readonly binding: WebStoreCatalogBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  /** Whether catalog is enabled in tenant config and a module was injected. */
  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.catalog');
  }

  async listActiveProducts(
    options?: Omit<ListProductsOptions, 'status' | 'activeOnly'>,
  ): Promise<Product[]> {
    return this.requireCatalog().listActiveProducts(this.tenantId, options);
  }

  async listProductsByCategory(
    categoryId: string,
    options?: Omit<ListProductsOptions, 'categoryId'>,
  ): Promise<Product[]> {
    return this.requireCatalog().listProductsByCategory(this.tenantId, categoryId, {
      ...options,
      activeOnly: options?.activeOnly ?? true,
    });
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.requireCatalog().getProductBySlug(this.tenantId, slug);
  }

  async searchProducts(query: string, options?: SearchProductsOptions): Promise<Product[]> {
    return this.requireCatalog().searchProducts(this.tenantId, query, {
      ...options,
      activeOnly: options?.activeOnly ?? true,
    });
  }

  private requireCatalog(): CatalogModule {
    if (!this.binding) {
      throw new WebStoreCatalogUnavailableException(
        'Catalog module is not wired. Pass catalog to createWebStore({ catalog }).',
      );
    }
    if (!this.flags.isEnabled('modules.catalog')) {
      throw new WebStoreCatalogUnavailableException(
        'Catalog module is disabled for this tenant (modules.catalog).',
      );
    }
    return this.binding.catalog;
  }
}
