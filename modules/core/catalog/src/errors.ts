/** Base error for catalog module failures. */
export class CatalogException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogException';
  }
}

/** Thrown when a product cannot be found. */
export class ProductNotFoundException extends CatalogException {
  readonly tenantId: string;
  readonly productId: string;

  constructor(tenantId: string, productId: string) {
    super(`Product '${productId}' not found for tenant '${tenantId}'.`);
    this.name = 'ProductNotFoundException';
    this.tenantId = tenantId;
    this.productId = productId;
  }
}

/** Thrown when a category cannot be found. */
export class CategoryNotFoundException extends CatalogException {
  readonly tenantId: string;
  readonly categoryId: string;

  constructor(tenantId: string, categoryId: string) {
    super(`Category '${categoryId}' not found for tenant '${tenantId}'.`);
    this.name = 'CategoryNotFoundException';
    this.tenantId = tenantId;
    this.categoryId = categoryId;
  }
}

/** Thrown when a slug is already used within a tenant. */
export class CatalogSlugConflictException extends CatalogException {
  readonly tenantId: string;
  readonly slug: string;
  readonly kind: 'product' | 'category';

  constructor(tenantId: string, slug: string, kind: 'product' | 'category') {
    super(`${kind} slug '${slug}' already exists for tenant '${tenantId}'.`);
    this.name = 'CatalogSlugConflictException';
    this.tenantId = tenantId;
    this.slug = slug;
    this.kind = kind;
  }
}

/** Thrown when a SKU is already used within a tenant. */
export class CatalogSkuConflictException extends CatalogException {
  readonly tenantId: string;
  readonly sku: string;

  constructor(tenantId: string, sku: string) {
    super(`SKU '${sku}' already exists for tenant '${tenantId}'.`);
    this.name = 'CatalogSkuConflictException';
    this.tenantId = tenantId;
    this.sku = sku;
  }
}

/** Thrown when catalog input fails validation. */
export class CatalogValidationException extends CatalogException {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogValidationException';
  }
}
