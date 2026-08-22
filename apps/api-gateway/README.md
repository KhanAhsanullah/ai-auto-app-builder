# API Gateway

Backend-for-Frontend (BFF) and edge API gateway for CommerceOS AI. Framework-agnostic request pipeline with tenant routing, rate limiting, and Config Runtime injection.

## Package

`@ai-commerce/api-gateway`

## Status

Sprint 7 Task 1 complete — tenant routing, route matching, rate limiting, config injection, middleware pipeline.

Task 2 (auth middleware) and Task 3 (HTTP adapter / gateway facade) are not yet implemented.

## Modules

| Module                   | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `TenantResolver`         | Resolve tenant from headers / subdomain             |
| `RouteMatcher`           | Method + `:param` path matching                     |
| `InMemoryRateLimiter`    | Fixed-window rate limiting                          |
| `ConfigInjector`         | ConfigProvider validation gate into request context |
| `createGatewayPipeline`  | Core middleware stack + error mapping               |
| `composeGatewayPipeline` | Onion middleware composition                        |

## Usage

```typescript
import {
  ConfigInjector,
  createGatewayPipeline,
  InMemoryRateLimiter,
  InMemoryTenantConfigLoader,
  InMemoryTenantDirectory,
  RouteMatcher,
  TenantResolver,
} from '@ai-commerce/api-gateway';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const directory = new InMemoryTenantDirectory();
directory.seed([{ id: '…', slug: 'acme' }]);

const routes = new RouteMatcher();
routes.register({ method: 'GET', path: '/health', requireTenant: false });
routes.register({ method: 'GET', path: '/v1/catalog' });

const pipeline = createGatewayPipeline({
  routeMatcher: routes,
  tenantResolver: new TenantResolver({ directory }),
  configInjector: new ConfigInjector({
    configProvider: new ConfigProvider({ cache: false }),
    configLoader,
  }),
  rateLimiter: new InMemoryRateLimiter(),
  handler: async (ctx) => ({ status: 200, body: { tenantId: ctx.tenant?.id } }),
});

await pipeline({ method: 'GET', path: '/v1/catalog', headers: { 'x-tenant-id': '…' } });
```

## Scripts

```bash
pnpm --filter @ai-commerce/api-gateway test
pnpm --filter @ai-commerce/api-gateway typecheck
pnpm --filter @ai-commerce/api-gateway lint
pnpm --filter @ai-commerce/api-gateway build
```

## Out of scope (Task 1)

- Auth middleware (`@ai-commerce/auth-client` integration) — Task 2
- Node/HTTP server adapter / `createApiGateway` facade — Task 3
- Upstream service aggregation / proxy
- Redis-backed rate limiting
