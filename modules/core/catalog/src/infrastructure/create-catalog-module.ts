import type { CatalogRepository } from '../domain/catalog-repository.js';
import { CatalogModule } from '../domain/catalog-module.js';
import { CatalogService } from '../domain/catalog-service.js';
import { InMemoryCatalogRepository } from './in-memory-catalog-repository.js';

export interface CreateCatalogModuleOptions {
  repository?: CatalogRepository;
  now?: () => string;
  createId?: () => string;
}

/**
 * Wire a CatalogModule with in-memory defaults (or an injected repository).
 */
export function createCatalogModule(options: CreateCatalogModuleOptions = {}): CatalogModule {
  const repository = options.repository ?? new InMemoryCatalogRepository();
  const service = new CatalogService({
    repository,
    now: options.now,
    createId: options.createId,
  });
  return new CatalogModule({ service });
}
