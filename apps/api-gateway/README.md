# API Gateway

Backend-for-Frontend (BFF) and edge API gateway for CommerceOS AI. Framework-agnostic request pipeline with tenant routing, rate limiting, Config Runtime injection, and auth middleware.

## Package

`@ai-commerce/api-gateway`

## Status

Sprint 7 Task 2 complete — auth middleware via `@ai-commerce/auth-client` (Bearer / session / API key).

Task 3 (`createApiGateway` facade / Node HTTP adapter) is not yet implemented.

## Modules

| Module                        | Purpose                                             |
| ----------------------------- | --------------------------------------------------- |
| `TenantResolver`              | Resolve tenant from headers / subdomain             |
| `RouteMatcher`                | Method + `:param` path matching                     |
| `InMemoryRateLimiter`         | Fixed-window rate limiting                          |
| `ConfigInjector`              | ConfigProvider validation gate into request context |
| `createAuthMiddleware`        | Bearer / session / API-key validation               |
| `GatewayCredentialValidator`  | Injectable credential introspection port            |
| `InMemoryCredentialValidator` | Test / local credential map                         |
| `createGatewayPipeline`       | Core middleware stack + auth + error mapping        |
| `composeGatewayPipeline`      | Onion middleware composition                        |

## Usage

```typescript
import {
  ConfigInjector,
  createGatewayPipeline,
  InMemoryCredentialValidator,
  InMemoryRateLimiter,
  RouteMatcher,
  TenantResolver,
  bearerPrincipal,
} from '@ai-commerce/api-gateway';
import { createAuthClient } from '@ai-commerce/auth-client';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const authClient = createAuthClient();
const validator = new InMemoryCredentialValidator();
validator.seed({
  kind: 'bearer',
  credential: 'access-token',
  principal: bearerPrincipal({
    subject: 'user-1',
    surface: 'customer',
    method: 'email',
    expiresAt: Date.now() + 60_000,
  }),
});

const routes = new RouteMatcher();
routes.register({ method: 'GET', path: '/health', requireTenant: false });
routes.register({
  method: 'GET',
  path: '/v1/me',
  requireAuth: true,
  authSurface: 'customer',
});

const pipeline = createGatewayPipeline({
  routeMatcher: routes,
  tenantResolver: new TenantResolver({ directory }),
  configInjector: new ConfigInjector({
    configProvider: new ConfigProvider({ cache: false }),
    configLoader,
  }),
  rateLimiter: new InMemoryRateLimiter(),
  auth: { authClient, validator },
  handler: async (ctx) => ({ status: 200, body: { subject: ctx.auth?.subject } }),
});
```

Routes opt in with `requireAuth: true`. Credentials: `Authorization: Bearer …`, session cookie `cos_session`, `x-session-token`, or `x-api-key` / `Authorization: ApiKey …`.

## Scripts

```bash
pnpm --filter @ai-commerce/api-gateway test
pnpm --filter @ai-commerce/api-gateway typecheck
pnpm --filter @ai-commerce/api-gateway lint
pnpm --filter @ai-commerce/api-gateway build
```

## Out of scope (Task 2)

- Node/HTTP server adapter / `createApiGateway` facade — Task 3
- Production IdP token introspection adapters
- Upstream service aggregation / proxy
- Redis-backed rate limiting
