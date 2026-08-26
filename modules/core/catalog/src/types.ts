/** Lifecycle status of a catalog product. */
export type ProductStatus = 'draft' | 'active' | 'archived';

/** Money amount in major units with an ISO-4217 currency code. */
export interface Money {
  amount: number;
  currency: string;
}

/** Sellable variant of a product (SKU-level). */
export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  attributes?: Record<string, string>;
}

/** Tenant-scoped product with one or more variants. */
export interface Product {
  tenantId: string;
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: ProductStatus;
  categoryIds: readonly string[];
  variants: readonly ProductVariant[];
  mediaIds?: readonly string[];
  createdAt: string;
  updatedAt: string;
}

/** Tenant-scoped category (optional parent for nesting). */
export interface Category {
  tenantId: string;
  id: string;
  slug: string;
  name: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a category. */
export interface CreateCategoryInput {
  tenantId: string;
  slug: string;
  name: string;
  parentId?: string;
  sortOrder?: number;
  id?: string;
}

/** Input for updating a category. */
export interface UpdateCategoryInput {
  tenantId: string;
  id: string;
  slug?: string;
  name?: string;
  parentId?: string | null;
  sortOrder?: number;
}

/** Input for creating a product variant (id optional). */
export interface CreateProductVariantInput {
  id?: string;
  sku: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  attributes?: Record<string, string>;
}

/** Input for creating a product. */
export interface CreateProductInput {
  tenantId: string;
  slug: string;
  name: string;
  description?: string;
  status?: ProductStatus;
  categoryIds?: readonly string[];
  variants: readonly CreateProductVariantInput[];
  mediaIds?: readonly string[];
  id?: string;
}

/** Input for updating a product. */
export interface UpdateProductInput {
  tenantId: string;
  id: string;
  slug?: string;
  name?: string;
  description?: string | null;
  status?: ProductStatus;
  categoryIds?: readonly string[];
  variants?: readonly CreateProductVariantInput[];
  mediaIds?: readonly string[] | null;
}

/** Filters for listing / querying products within a tenant. */
export interface ListProductsOptions {
  /** Only products that include this category id. */
  categoryId?: string;
  /** Filter by one or more statuses. */
  status?: ProductStatus | readonly ProductStatus[];
  /** Shorthand for `status: 'active'`. */
  activeOnly?: boolean;
  /** Case-insensitive substring match on product name or slug. */
  search?: string;
}

/** Options for text search (category / status filters). */
export interface SearchProductsOptions {
  categoryId?: string;
  status?: ProductStatus | readonly ProductStatus[];
  activeOnly?: boolean;
}
