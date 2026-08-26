export type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateProductVariantInput,
  Money,
  Product,
  ProductStatus,
  ProductVariant,
  UpdateCategoryInput,
  UpdateProductInput,
} from './types.js';
export {
  CatalogException,
  CatalogSkuConflictException,
  CatalogSlugConflictException,
  CatalogValidationException,
  CategoryNotFoundException,
  ProductNotFoundException,
} from './errors.js';
export type { CatalogRepository } from './domain/catalog-repository.js';
export { CatalogService } from './domain/catalog-service.js';
export type { CatalogServiceDeps } from './domain/catalog-service.js';
export { InMemoryCatalogRepository } from './infrastructure/in-memory-catalog-repository.js';
