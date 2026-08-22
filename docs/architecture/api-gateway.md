# API Gateway Architecture

Framework-agnostic BFF / edge gateway for tenant-aware commerce API traffic.

## Overview

`@ai-commerce/api-gateway` resolves tenant identity, matches routes, applies rate limits, and injects Config Runtime output into a request context. It does not yet bind to a specific HTTP framework (Task 3) or enforce auth sessions (Task 2).

## Boundaries

```
Client request (headers / host)
        ↓
RouteMatcher
        ↓
TenantResolver (x-tenant-id | x-tenant-slug | subdomain)
        ↓
RateLimiter
        ↓
ConfigInjector → ConfigProvider.resolve()
        ↓
Handler / future auth middleware (Task 2) / HTTP adapter (Task 3)
```

| Concern                | Owner                         |
| ---------------------- | ----------------------------- |
| Tenant config merge    | `@ai-commerce/config-runtime` |
| Auth sessions / tokens | `@ai-commerce/auth-client`    |
| Gateway pipeline       | `@ai-commerce/api-gateway`    |
| HTTP listen/serve      | Task 3 adapter                |

## Sprint 7 Task Breakdown

| Task   | Deliverable                                                    |
| ------ | -------------------------------------------------------------- |
| Task 1 | Tenant routing, routes, rate limit, config injection, pipeline |
| Task 2 | Auth middleware (Bearer / session validation via auth-client)  |
| Task 3 | `createApiGateway` facade, Node HTTP adapter, integration docs |

## Tenant resolution order

1. `x-tenant-id`
2. `x-tenant-slug`
3. Left-most Host subdomain (optional; skips reserved labels)

## Deferred

- Auth middleware (Task 2)
- Production HTTP server binding (Task 3)
- Distributed rate limiting
- Request aggregation / BFF composition graphs
