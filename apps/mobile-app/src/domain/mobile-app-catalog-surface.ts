import type {
  CatalogModule,
  ListProductsOptions,
  Product,
  SearchProductsOptions,
} from '@ai-commerce/module-catalog';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { MobileAppCatalogUnavailableException } from '../errors.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppCatalogBinding {
  catalog: CatalogModule;
}

/**
 * Mobile storefront catalog access: feature-flag gated + tenant-scoped.
 */
export class MobileAppCatalogSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedMobileAppShell,
    private readonly binding: MobileAppCatalogBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

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
      throw new MobileAppCatalogUnavailableException(
        'Catalog module is not wired. Pass catalog to createMobileApp({ catalog }).',
      );
    }
    if (!this.flags.isEnabled('modules.catalog')) {
      throw new MobileAppCatalogUnavailableException(
        'Catalog module is disabled for this tenant (modules.catalog).',
      );
    }
    return this.binding.catalog;
  }
}
