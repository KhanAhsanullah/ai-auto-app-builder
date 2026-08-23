# API Gateway

Backend-for-Frontend (BFF) and edge API gateway for CommerceOS AI. Framework-agnostic request pipeline with tenant routing, rate limiting, Config Runtime injection, auth middleware, and a Node HTTP facade.

## Package

`@ai-commerce/api-gateway`

## Status

Sprint 7 complete — Task 3 delivers `createApiGateway` / `ApiGateway` facade and Node HTTP adapter.

## Modules

| Module                       | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `ApiGateway`                 | Public facade — `handle`, `listen`, `createHttpServer` |
| `createApiGateway`           | Default wiring factory                                 |
| `createNodeHttpServer`       | Node `http.Server` adapter                             |
| `TenantResolver`             | Resolve tenant from headers / subdomain                |
| `RouteMatcher`               | Method + `:param` path matching                        |
| `InMemoryRateLimiter`        | Fixed-window rate limiting                             |
| `ConfigInjector`             | ConfigProvider validation gate into request context    |
| `createAuthMiddleware`       | Bearer / session / API-key validation                  |
| `GatewayCredentialValidator` | Injectable credential introspection port               |
| `createGatewayPipeline`      | Core middleware stack + auth + error mapping           |

## Usage

```typescript
import {
  createApiGateway,
  InMemoryTenantConfigLoader,
  InMemoryTenantDirectory,
} from '@ai-commerce/api-gateway';

const directory = new InMemoryTenantDirectory();
directory.seed([{ id: '…', slug: 'acme' }]);

const gateway = createApiGateway({
  directory,
  configLoader,
  routes: [
    { method: 'GET', path: '/health', requireTenant: false },
    { method: 'GET', path: '/v1/catalog' },
  ],
  handler: async (ctx) => ({
    status: 200,
    body: { tenantId: ctx.tenant?.id, vertical: ctx.config?.vertical },
  }),
});

// Framework-agnostic
await gateway.handle({ method: 'GET', path: '/health', headers: {} });

// Node HTTP
const { port, close } = await gateway.listen(3000);
// GET http://127.0.0.1:3000/health
await close();
```

### Auth (optional)

Pass `auth: { authClient, validator }` and mark routes with `requireAuth: true`. Credentials: `Authorization: Bearer …`, session cookie `cos_session`, `x-session-token`, or `x-api-key` / `Authorization: ApiKey …`.

## Scripts

```bash
pnpm --filter @ai-commerce/api-gateway test
pnpm --filter @ai-commerce/api-gateway typecheck
pnpm --filter @ai-commerce/api-gateway lint
pnpm --filter @ai-commerce/api-gateway build
```

## Out of scope

- Production IdP token introspection adapters
- Upstream service aggregation / proxy
- Redis-backed rate limiting
- TLS termination (use a reverse proxy or wrap `createHttpServer`)
