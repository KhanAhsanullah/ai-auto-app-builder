export type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateProductVariantInput,
  ListProductsOptions,
  Money,
  Product,
  ProductStatus,
  ProductVariant,
  SearchProductsOptions,
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
export { CatalogModule } from './domain/catalog-module.js';
export type { CatalogModuleDeps } from './domain/catalog-module.js';
export { InMemoryCatalogRepository } from './infrastructure/in-memory-catalog-repository.js';
export { createCatalogModule } from './infrastructure/create-catalog-module.js';
export type { CreateCatalogModuleOptions } from './infrastructure/create-catalog-module.js';
