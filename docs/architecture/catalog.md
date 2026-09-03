# Catalog Module

Core data-plane domain module (`@ai-commerce/module-catalog`) for tenant-scoped products, variants, and categories. Powers Web Store, Admin Dashboard, and Mobile catalog surfaces.

## Principles

1. **Tenant-aware** — every product and category is scoped by `tenantId`.
2. **Variants are sellable units** — products require ≥1 variant with unique SKUs.
3. **Config does not store catalog data** — tenant config enables the catalog feature; product records live in this module.
4. **Clean Architecture** — domain ports + service; infrastructure adapters (in-memory now; DB later).
5. **Facade entry** — callers use `createCatalogModule` / `CatalogModule`.

## Flow

```
createCatalogModule() → CatalogModule
        │
        ├─ createCategory / createProduct / update*
        ├─ listProducts / listProductsByCategory / listActiveProducts
        └─ searchProducts / getProductBySlug / getCategoryBySlug
                │
                ▼
          CatalogService → CatalogRepository
```

## Surface wiring

Gate catalog UI with tenant config `features.catalog` (via Config Runtime). Then inject one module instance per process (or per request with a shared repository):

| Surface             | Typical calls                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Web Store**       | `listActiveProducts`, `listProductsByCategory(..., { activeOnly: true })`, `getProductBySlug`, `searchProducts(..., { activeOnly: true })` |
| **Mobile App**      | Same as Web Store                                                                                                                          |
| **Admin Dashboard** | Full CRUD: `createProduct` / `updateProduct` / `listProducts` (all statuses), category management                                          |
| **API Gateway**     | Thin handlers that call the same facade (HTTP deferred)                                                                                    |

```ts
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createWebStore } from '@ai-commerce/web-store';

const catalog = createCatalogModule();
const store = createWebStore({ config: resolvedConfig, catalog });
const products = await store.catalogSurface.listActiveProducts();
```

Do **not** put product records in tenant JSON config — config only toggles the feature and navigation routes (`store.catalog`, `admin.catalog`).

## Sprint 14 Task Breakdown

| Task   | Deliverable                                                              |
| ------ | ------------------------------------------------------------------------ |
| Task 1 | Domain model, `CatalogService`, in-memory repository                     |
| Task 2 | Queries (by category, active-only), search helpers                       |
| Task 3 | `CatalogModule` / `createCatalogModule` facade + surface wiring guidance |

## Deferred

- Real database adapters
- HTTP / GraphQL API handlers
- Inventory reservations (Inventory module)
- Media binary storage (Media module)
- Full Admin/Web screen component integration (follow-up; surfaces expose `catalogSurface`)
