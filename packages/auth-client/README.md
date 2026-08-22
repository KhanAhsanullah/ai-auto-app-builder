# Auth Client

Authentication client library for CommerceOS AI: tenant-scoped auth policy resolution, provider ports, and (in later tasks) OAuth/PKCE, magic link, token refresh, and secure storage adapters.

## Package

`@ai-commerce/auth-client`

## Status

Sprint 6 Task 1 complete — auth policy foundation from tenant `authentication` config.

Task 2 (provider adapters / OAuth / magic link / token refresh) and Task 3 (`AuthClient` facade + surface wiring) are not yet implemented.

## Modules

| Module                            | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `AuthPolicyValidator`             | Semantic cross-field validation of authentication config  |
| `AuthPolicyResolver`              | Surface-scoped policy resolution (customer / admin / api) |
| `AuthProviderRegistry`            | In-process registry of auth provider ports                |
| `AuthProvider` / `TokenStore` / … | Provider ports (contracts only in Task 1)                 |
| `StubAuthProvider`                | Test/stub provider adapter                                |
| `InMemoryTokenStore`              | In-memory token store for tests                           |
| `toResolveAuthPolicyInput`        | Config Runtime → resolver mapping without re-resolution   |

## Usage

```typescript
import {
  AuthPolicyResolver,
  authConfigSourceFromProviderResult,
  toResolveAuthPolicyInput,
} from '@ai-commerce/auth-client';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const source = authConfigSourceFromProviderResult(result);
const policy = new AuthPolicyResolver().resolve(toResolveAuthPolicyInput(source, 'customer'));
```

## Scripts

```bash
pnpm --filter @ai-commerce/auth-client test
pnpm --filter @ai-commerce/auth-client typecheck
pnpm --filter @ai-commerce/auth-client lint
pnpm --filter @ai-commerce/auth-client build
```

## Out of scope (Task 1)

- Live OAuth/PKCE, SSO, or magic-link network flows
- Real secure storage (web / React Native)
- `AuthClient` facade / `createAuthClient()`
- HTTP auth middleware (Sprint 7 API Gateway)
- Changes to `authentication.schema.json` (already shipped in Sprint 1)
