import type { CatalogRepository } from '../domain/catalog-repository.js';
import {
  CatalogException,
  CategoryNotFoundException,
  ProductNotFoundException,
} from '../errors.js';
import type { Category, Product } from '../types.js';

function categoryKey(tenantId: string, categoryId: string): string {
  return `${tenantId}::cat::${categoryId}`;
}

function productKey(tenantId: string, productId: string): string {
  return `${tenantId}::prod::${productId}`;
}

/** In-memory CatalogRepository for tests and local development. */
export class InMemoryCatalogRepository implements CatalogRepository {
  private readonly categories = new Map<string, Category>();
  private readonly products = new Map<string, Product>();

  async saveCategory(category: Category): Promise<void> {
    const key = categoryKey(category.tenantId, category.id);
    if (this.categories.has(key)) {
      throw new CatalogException(
        `Category '${category.id}' already exists for tenant '${category.tenantId}'.`,
      );
    }
    this.categories.set(key, structuredClone(category));
  }

  async updateCategory(category: Category): Promise<void> {
    const key = categoryKey(category.tenantId, category.id);
    if (!this.categories.has(key)) {
      throw new CategoryNotFoundException(category.tenantId, category.id);
    }
    this.categories.set(key, structuredClone(category));
  }

  async findCategoryById(tenantId: string, categoryId: string): Promise<Category | undefined> {
    const found = this.categories.get(categoryKey(tenantId, categoryId));
    return found ? structuredClone(found) : undefined;
  }

  async findCategoryBySlug(tenantId: string, slug: string): Promise<Category | undefined> {
    for (const category of this.categories.values()) {
      if (category.tenantId === tenantId && category.slug === slug) {
        return structuredClone(category);
      }
    }
    return undefined;
  }

  async listCategoriesByTenant(tenantId: string): Promise<Category[]> {
    return [...this.categories.values()]
      .filter((category) => category.tenantId === tenantId)
      .map((category) => structuredClone(category));
  }

  async saveProduct(product: Product): Promise<void> {
    const key = productKey(product.tenantId, product.id);
    if (this.products.has(key)) {
      throw new CatalogException(
        `Product '${product.id}' already exists for tenant '${product.tenantId}'.`,
      );
    }
    this.products.set(key, structuredClone(product));
  }

  async updateProduct(product: Product): Promise<void> {
    const key = productKey(product.tenantId, product.id);
    if (!this.products.has(key)) {
      throw new ProductNotFoundException(product.tenantId, product.id);
    }
    this.products.set(key, structuredClone(product));
  }

  async findProductById(tenantId: string, productId: string): Promise<Product | undefined> {
    const found = this.products.get(productKey(tenantId, productId));
    return found ? structuredClone(found) : undefined;
  }

  async findProductBySlug(tenantId: string, slug: string): Promise<Product | undefined> {
    for (const product of this.products.values()) {
      if (product.tenantId === tenantId && product.slug === slug) {
        return structuredClone(product);
      }
    }
    return undefined;
  }

  async listProductsByTenant(tenantId: string): Promise<Product[]> {
    return [...this.products.values()]
      .filter((product) => product.tenantId === tenantId)
      .map((product) => structuredClone(product));
  }

  async findProductBySku(
    tenantId: string,
    sku: string,
    excludeProductId?: string,
  ): Promise<Product | undefined> {
    for (const product of this.products.values()) {
      if (product.tenantId !== tenantId) continue;
      if (excludeProductId && product.id === excludeProductId) continue;
      if (product.variants.some((variant) => variant.sku === sku)) {
        return structuredClone(product);
      }
    }
    return undefined;
  }
}
