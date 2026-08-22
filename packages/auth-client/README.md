# Auth Client

Authentication client library for CommerceOS AI: tenant-scoped auth policy resolution, OAuth/PKCE, magic link, SSO challenges, token refresh, and secure storage adapters.

## Package

`@ai-commerce/auth-client`

## Status

Sprint 6 Task 2 complete — OAuth/PKCE, magic link, SSO adapters, token refresh, and secure storage.

Task 3 (`AuthClient` facade + multi-surface helpers) is not yet implemented.

## Modules

| Module                     | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| `AuthPolicyValidator`      | Semantic cross-field validation of authentication config  |
| `AuthPolicyResolver`       | Surface-scoped policy resolution (customer / admin / api) |
| `AuthProviderRegistry`     | In-process registry of auth provider ports                |
| `OAuthPkceProvider`        | Authorization-code + PKCE for social/OIDC methods         |
| `MagicLinkProvider`        | Email magic-link challenge + completion                   |
| `SsoChallengeProvider`     | Admin SAML / OIDC SSO challenges                          |
| `TokenRefreshService`      | Refresh-token grant + TokenStore persistence              |
| `PrefixedSecureTokenStore` | localStorage-compatible secure token store                |
| `pkce` helpers             | Verifier / S256 challenge / state / URL builders          |

HTTP and email delivery use injectable ports — no live IdP or mailer is required in unit tests.

## Usage

```typescript
import {
  AuthPolicyResolver,
  OAuthPkceProvider,
  InMemoryPkceChallengeStore,
  ScriptedHttpJsonClient, // tests; use a real HttpJsonClient in apps
} from '@ai-commerce/auth-client';

const provider = new OAuthPkceProvider({
  method: 'google',
  surfaces: ['customer'],
  client: {
    clientId: '…',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'email'],
  },
  http,
  challengeStore: new InMemoryPkceChallengeStore(),
});

const { authorizationUrl, challengeId, state } = await provider.start({
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

## Out of scope (Task 2)

- `AuthClient` facade / `createAuthClient()` (Task 3)
- HTTP auth middleware (Sprint 7 API Gateway)
- Production IdP SDKs / React Native Keychain native modules
- Changes to `authentication.schema.json`
