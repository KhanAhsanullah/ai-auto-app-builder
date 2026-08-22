# Authentication Architecture

Tenant-scoped authentication policy resolution, interactive auth flows, token lifecycle, and the `AuthClient` facade for CommerceOS AI.

## Overview

`@ai-commerce/auth-client` turns the tenant `authentication` configuration section into surface-scoped policies and provides adapters for OAuth/PKCE, magic link, SSO, token refresh, and storage — orchestrated by `AuthClient` / `createAuthClient()`.

It does **not** own HTTP middleware (Sprint 7). Live IdP SDKs are optional — adapters use injectable `HttpJsonClient` / delivery ports.

## Boundaries

```
Tenant config (authentication.*)
        ↓
ConfigProvider.resolve()
        ↓
createAuthClient() → AuthClient facade
        ├── AuthPolicyResolver (customer / admin / api)
        ├── OAuthPkceProvider / MagicLinkProvider / SsoChallengeProvider
        └── TokenRefreshService + TokenStore
```

| Concern                         | Owner                      |
| ------------------------------- | -------------------------- |
| Authentication JSON Schema      | Sprint 1 `config-schema`   |
| Platform/vertical auth defaults | `config-runtime` defaults  |
| Policy + auth flows + facade    | `@ai-commerce/auth-client` |
| HTTP auth middleware            | API Gateway (Sprint 7)     |

## Sprint 6 Task Breakdown

| Task   | Deliverable                                                              |
| ------ | ------------------------------------------------------------------------ |
| Task 1 | Policy validator/resolver, Config Runtime mapping, provider ports, stubs |
| Task 2 | OAuth/PKCE, magic link, SSO challenge adapters, token refresh, storage   |
| Task 3 | `AuthClient` facade, multi-surface helpers, `createAuthClient`, docs     |

## Flows

| Flow       | Method id(s)             | Notes                                      |
| ---------- | ------------------------ | ------------------------------------------ |
| OAuth+PKCE | google, apple, facebook  | Auth code + S256; injectable token HTTP    |
| Magic link | email                    | Delivery port sends link; confirm by token |
| SSO OIDC   | sso                      | Admin; PKCE against issuer endpoints       |
| SSO SAML   | sso                      | Admin; RelayState + assertion handoff      |
| Refresh    | (any with refresh_token) | Honors `session.refreshEnabled`            |

## Surfaces

| Surface    | Methods (from config)                        |
| ---------- | -------------------------------------------- |
| `customer` | email, phone, guest, google, apple, facebook |
| `admin`    | email, sso (saml/oidc)                       |
| `api`      | api_key, client_credentials                  |

Session tokens are stored per surface under `session.{surface}.tokens`.

## Deferred

- Permission/ACL enforcement beyond defaultRoles metadata
- Session revocation service
- Changes to authentication JSON Schema without versioning
- Native Keychain / Web Crypto SubtleCrypto browser builds (Node crypto used server-side)
- HTTP middleware (Sprint 7)
