# Catalog Module

Core data-plane domain module (`@ai-commerce/module-catalog`) for tenant-scoped products, variants, and categories. Powers Web Store, Admin Dashboard, and Mobile catalog surfaces.

## Principles

1. **Tenant-aware** — every product and category is scoped by `tenantId`.
2. **Variants are sellable units** — products require ≥1 variant with unique SKUs.
3. **Config does not store catalog data** — tenant config enables the catalog feature; product records live in this module.
4. **Clean Architecture** — domain ports + service; infrastructure adapters (in-memory now; DB later).

## Flow

```
CreateCategory / CreateProduct
        │
        ▼
  CatalogService  ──validate slug/SKU/categories──▶ CatalogRepository
        │
        ├── listProducts / listProductsByCategory / listActiveProducts
        └── searchProducts / getCategoryBySlug
        │
        ▼
  Category / Product (draft | active | archived)
```

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
- Full Admin/Web screen integration (later sprint tasks)
