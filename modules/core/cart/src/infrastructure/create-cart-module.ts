import type { CartRepository } from '../domain/cart-repository.js';
import type { CatalogProductLookup } from '../domain/catalog-product-lookup.js';
import { CartModule } from '../domain/cart-module.js';
import { CartService } from '../domain/cart-service.js';
import { InMemoryCartRepository } from './in-memory-cart-repository.js';

export interface CreateCartModuleOptions {
  repository?: CartRepository;
  /** Optional catalog price / variant validation (no hard module-catalog dep). */
  catalogLookup?: CatalogProductLookup;
  now?: () => string;
  createId?: () => string;
}

/**
 * Wire a CartModule with in-memory defaults (or injected ports).
 */
export function createCartModule(options: CreateCartModuleOptions = {}): CartModule {
  const repository = options.repository ?? new InMemoryCartRepository();
  const service = new CartService({
    repository,
    catalogLookup: options.catalogLookup,
    now: options.now,
    createId: options.createId,
  });
  return new CartModule({ service });
}
