# Auth Client

Authentication client library for CommerceOS AI: tenant-scoped auth policy resolution, OAuth/PKCE, magic link, SSO, token refresh, secure storage, and the `AuthClient` facade.

## Package

`@ai-commerce/auth-client`

## Status

Sprint 6 complete — Task 3 delivers `AuthClient` / `createAuthClient()` and multi-surface helpers.

## Modules

| Module                     | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `AuthClient`               | Public facade for policy, flows, and surface sessions |
| `createAuthClient`         | Default wiring factory                                |
| `AuthPolicyResolver`       | Surface-scoped policy resolution                      |
| `OAuthPkceProvider`        | Authorization-code + PKCE                             |
| `MagicLinkProvider`        | Email magic-link                                      |
| `SsoChallengeProvider`     | Admin SAML / OIDC SSO                                 |
| `TokenRefreshService`      | Refresh-token grant + TokenStore persistence          |
| `PrefixedSecureTokenStore` | localStorage-compatible secure token store            |
| Surface helpers            | `resolveAllSurfacePolicies`, `sessionStorageKey`, …   |

Advanced modules are also available via `@ai-commerce/auth-client/internal`.

## Usage

```typescript
import { createAuthClient } from '@ai-commerce/auth-client';

const auth = createAuthClient({
  http,
  oauth: {
    clients: {
      google: {
        clientId: '…',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        scopes: ['openid', 'email'],
      },
    },
  },
  magicLink: {
    delivery,
    magicLinkBaseUrl: 'https://app.example.com/auth/magic',
  },
});

const policies = auth.resolveAllPolicies(authentication);
const { authorizationUrl } = await auth.startOAuth({
  authentication,
  method: 'google',
  surface: 'customer',
  redirectUri: 'https://app.example.com/callback',
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/auth-client test
pnpm --filter @ai-commerce/auth-client typecheck
pnpm --filter @ai-commerce/auth-client lint
pnpm --filter @ai-commerce/auth-client build
```

## Out of scope (Sprint 6)

- HTTP auth middleware (owned by `@ai-commerce/api-gateway`, Sprint 7 Task 2)
- Production IdP SDKs / React Native Keychain native modules
- Changes to `authentication.schema.json`
