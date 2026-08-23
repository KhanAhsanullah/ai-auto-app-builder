# API Gateway Architecture

Framework-agnostic BFF / edge gateway for tenant-aware commerce API traffic, with an optional Node.js HTTP binding.

## Overview

`@ai-commerce/api-gateway` resolves tenant identity, matches routes, applies rate limits, injects Config Runtime output, and enforces auth for opted-in routes via `@ai-commerce/auth-client`. Sprint 7 Task 3 adds the `ApiGateway` facade and Node HTTP adapter.

## Boundaries

```
Client (HTTP or in-process)
        ↓
ApiGateway.handle / createNodeHttpServer
        ↓
RouteMatcher
        ↓
TenantResolver (x-tenant-id | x-tenant-slug | subdomain)
        ↓
RateLimiter
        ↓
ConfigInjector → ConfigProvider.resolve()
        ↓
Auth middleware (requireAuth routes)
        ↓
Handler
```

| Concern                | Owner                                        |
| ---------------------- | -------------------------------------------- |
| Tenant config merge    | `@ai-commerce/config-runtime`                |
| Auth sessions / tokens | `@ai-commerce/auth-client`                   |
| Gateway pipeline       | `@ai-commerce/api-gateway`                   |
| HTTP listen/serve      | `createNodeHttpServer` / `ApiGateway.listen` |

## Sprint 7 Task Breakdown

| Task   | Deliverable                                                    |
| ------ | -------------------------------------------------------------- |
| Task 1 | Tenant routing, routes, rate limit, config injection, pipeline |
| Task 2 | Auth middleware (Bearer / session / API key via auth-client)   |
| Task 3 | `createApiGateway` facade, Node HTTP adapter, integration docs |

## Facade (Task 3)

- `createApiGateway(options)` — wires directory, config loader, routes, rate limiter, optional auth
- `ApiGateway.handle(request)` — in-process / test entry
- `ApiGateway.createHttpServer()` — unbound `http.Server`
- `ApiGateway.listen(port)` — bind + start; supports ephemeral port `0`
- Adapter maps `IncomingMessage` → `GatewayRequest` (path, query, JSON body, client IP) and writes `GatewayResponse`

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

- Production IdP / session-store introspection adapters
- Distributed rate limiting
- Request aggregation / BFF composition graphs
- Built-in TLS (terminate at reverse proxy or wrap the Node server)
