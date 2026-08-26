import type { CatalogService } from './catalog-service.js';
import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  ListProductsOptions,
  Product,
  SearchProductsOptions,
  UpdateCategoryInput,
  UpdateProductInput,
} from '../types.js';

export interface CatalogModuleDeps {
  service: CatalogService;
}

/**
 * Public facade for tenant catalog CRUD and storefront queries.
 */
export class CatalogModule {
  constructor(private readonly deps: CatalogModuleDeps) {}

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    return this.deps.service.createCategory(input);
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    return this.deps.service.updateCategory(input);
  }

  async getCategory(tenantId: string, categoryId: string): Promise<Category> {
    return this.deps.service.getCategory(tenantId, categoryId);
  }

  async getCategoryBySlug(tenantId: string, slug: string): Promise<Category> {
    return this.deps.service.getCategoryBySlug(tenantId, slug);
  }

  async listCategories(tenantId: string): Promise<Category[]> {
    return this.deps.service.listCategories(tenantId);
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    return this.deps.service.createProduct(input);
  }

  async updateProduct(input: UpdateProductInput): Promise<Product> {
    return this.deps.service.updateProduct(input);
  }

  async getProduct(tenantId: string, productId: string): Promise<Product> {
    return this.deps.service.getProduct(tenantId, productId);
  }

  async getProductBySlug(tenantId: string, slug: string): Promise<Product> {
    return this.deps.service.getProductBySlug(tenantId, slug);
  }

  async listProducts(tenantId: string, options?: ListProductsOptions): Promise<Product[]> {
    return this.deps.service.listProducts(tenantId, options);
  }

  async listProductsByCategory(
    tenantId: string,
    categoryId: string,
    options?: Omit<ListProductsOptions, 'categoryId'>,
  ): Promise<Product[]> {
    return this.deps.service.listProductsByCategory(tenantId, categoryId, options);
  }

  async listActiveProducts(
    tenantId: string,
    options?: Omit<ListProductsOptions, 'status' | 'activeOnly'>,
  ): Promise<Product[]> {
    return this.deps.service.listActiveProducts(tenantId, options);
  }

  async searchProducts(
    tenantId: string,
    query: string,
    options?: SearchProductsOptions,
  ): Promise<Product[]> {
    return this.deps.service.searchProducts(tenantId, query, options);
  }
}
