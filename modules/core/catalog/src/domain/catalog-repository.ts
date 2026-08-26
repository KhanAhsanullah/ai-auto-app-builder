import type { Category, Product } from '../types.js';

/** Persistence port for tenant-scoped catalog documents. */
export interface CatalogRepository {
  saveCategory(category: Category): Promise<void>;
  updateCategory(category: Category): Promise<void>;
  findCategoryById(tenantId: string, categoryId: string): Promise<Category | undefined>;
  findCategoryBySlug(tenantId: string, slug: string): Promise<Category | undefined>;
  listCategoriesByTenant(tenantId: string): Promise<Category[]>;

  saveProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  findProductById(tenantId: string, productId: string): Promise<Product | undefined>;
  findProductBySlug(tenantId: string, slug: string): Promise<Product | undefined>;
  listProductsByTenant(tenantId: string): Promise<Product[]>;
  /** Find any product that already owns the SKU (optionally excluding a product id). */
  findProductBySku(
    tenantId: string,
    sku: string,
    excludeProductId?: string,
  ): Promise<Product | undefined>;
}
