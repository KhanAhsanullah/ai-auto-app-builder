# API Gateway Architecture

Framework-agnostic BFF / edge gateway for tenant-aware commerce API traffic.

## Overview

`@ai-commerce/api-gateway` resolves tenant identity, matches routes, applies rate limits, injects Config Runtime output, and enforces auth for opted-in routes via `@ai-commerce/auth-client` policy resolution plus an injectable credential validator.

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
Auth middleware (requireAuth routes) → AuthClient policy + credential validator
        ↓
Handler / HTTP adapter (Task 3)
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
| Task 2 | Auth middleware (Bearer / session / API key via auth-client)   |
| Task 3 | `createApiGateway` facade, Node HTTP adapter, integration docs |

## Auth middleware (Task 2)

- Routes opt in with `requireAuth: true` and optional `authSurface` (`customer` | `admin` | `api`)
- Policy resolved with `AuthClient.resolvePolicyFromConfigProvider` from injected config
- Credentials (preference order):
  1. `Authorization: Bearer <token>`
  2. `Authorization: ApiKey <key>`
  3. `x-api-key`
  4. Cookie `cos_session` (or `x-session-token`)
- `GatewayCredentialValidator` port introspects opaque credentials; `InMemoryCredentialValidator` for tests
- Failures map to HTTP 401 with `WWW-Authenticate: Bearer`

## Tenant resolution order

1. `x-tenant-id`
2. `x-tenant-slug`
3. Left-most Host subdomain (optional; skips reserved labels)

## Deferred

- Production HTTP server binding (Task 3)
- Production IdP / session-store introspection adapters
- Distributed rate limiting
- Request aggregation / BFF composition graphs
