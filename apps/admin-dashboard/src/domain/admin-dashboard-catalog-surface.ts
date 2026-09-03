import type {
  CatalogModule,
  Category,
  CreateCategoryInput,
  CreateProductInput,
  ListProductsOptions,
  Product,
  SearchProductsOptions,
  UpdateCategoryInput,
  UpdateProductInput,
} from '@ai-commerce/module-catalog';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { AdminDashboardCatalogUnavailableException } from '../errors.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

export interface AdminDashboardCatalogBinding {
  catalog: CatalogModule;
}

type CreateCategoryFields = Omit<CreateCategoryInput, 'tenantId'>;
type CreateProductFields = Omit<CreateProductInput, 'tenantId'>;
type UpdateCategoryFields = Omit<UpdateCategoryInput, 'tenantId'>;
type UpdateProductFields = Omit<UpdateProductInput, 'tenantId'>;

/**
 * Admin catalog access: feature-flag gated + tenant-scoped CRUD.
 */
export class AdminDashboardCatalogSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedAdminDashboardShell,
    private readonly binding: AdminDashboardCatalogBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.catalog');
  }

  async listProducts(options?: ListProductsOptions): Promise<Product[]> {
    return this.requireCatalog().listProducts(this.tenantId, options);
  }

  async listProductsByCategory(
    categoryId: string,
    options?: Omit<ListProductsOptions, 'categoryId'>,
  ): Promise<Product[]> {
    return this.requireCatalog().listProductsByCategory(this.tenantId, categoryId, options);
  }

  async getProduct(productId: string): Promise<Product> {
    return this.requireCatalog().getProduct(this.tenantId, productId);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.requireCatalog().getProductBySlug(this.tenantId, slug);
  }

  async searchProducts(query: string, options?: SearchProductsOptions): Promise<Product[]> {
    return this.requireCatalog().searchProducts(this.tenantId, query, options);
  }

  async createProduct(input: CreateProductFields): Promise<Product> {
    return this.requireCatalog().createProduct({ ...input, tenantId: this.tenantId });
  }

  async updateProduct(input: UpdateProductFields): Promise<Product> {
    return this.requireCatalog().updateProduct({ ...input, tenantId: this.tenantId });
  }

  async listCategories(): Promise<Category[]> {
    return this.requireCatalog().listCategories(this.tenantId);
  }

  async getCategory(categoryId: string): Promise<Category> {
    return this.requireCatalog().getCategory(this.tenantId, categoryId);
  }

  async createCategory(input: CreateCategoryFields): Promise<Category> {
    return this.requireCatalog().createCategory({ ...input, tenantId: this.tenantId });
  }

  async updateCategory(input: UpdateCategoryFields): Promise<Category> {
    return this.requireCatalog().updateCategory({ ...input, tenantId: this.tenantId });
  }

  private requireCatalog(): CatalogModule {
    if (!this.binding) {
      throw new AdminDashboardCatalogUnavailableException(
        'Catalog module is not wired. Pass catalog to createAdminDashboard({ catalog }).',
      );
    }
    if (!this.flags.isEnabled('modules.catalog')) {
      throw new AdminDashboardCatalogUnavailableException(
        'Catalog module is disabled for this tenant (modules.catalog).',
      );
    }
    return this.binding.catalog;
  }
}
