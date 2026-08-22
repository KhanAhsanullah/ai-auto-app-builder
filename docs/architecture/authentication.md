# Authentication Architecture

Tenant-scoped authentication policy resolution and provider ports for CommerceOS AI.

## Overview

`@ai-commerce/auth-client` turns the tenant `authentication` configuration section into surface-scoped policies (customer, admin, api) and exposes ports for auth providers and token storage.

It does **not** own identity storage, HTTP middleware, or IdP integrations in Sprint 6 Task 1 — those arrive in later tasks / Sprint 7.

## Boundaries

```
Tenant config (authentication.*)
        ↓
ConfigProvider.resolve()          ← inheritance + Zod (config-runtime)
        ↓
authConfigSourceFromProviderResult
        ↓
AuthPolicyValidator + AuthPolicyResolver
        ↓
ResolvedAuthPolicy (per surface)
        ↓
AuthProviderRegistry → AuthProvider ports (Task 2+ adapters)
```

| Concern                         | Owner                      |
| ------------------------------- | -------------------------- |
| Authentication JSON Schema      | Sprint 1 `config-schema`   |
| Platform/vertical auth defaults | `config-runtime` defaults  |
| Policy resolve + provider ports | `@ai-commerce/auth-client` |
| HTTP auth middleware            | API Gateway (Sprint 7)     |
| Live IdP / OAuth adapters       | Auth-client Task 2+        |

## Sprint 6 Task Breakdown

| Task   | Deliverable                                                              |
| ------ | ------------------------------------------------------------------------ |
| Task 1 | Policy validator/resolver, Config Runtime mapping, provider ports, stubs |
| Task 2 | OAuth/PKCE, magic link, SSO challenge adapters, token refresh, storage   |
| Task 3 | `AuthClient` facade, multi-surface helpers, integration docs             |

## Surfaces

| Surface    | Methods (from config)                        |
| ---------- | -------------------------------------------- |
| `customer` | email, phone, guest, google, apple, facebook |
| `admin`    | email, sso (saml/oidc)                       |
| `api`      | api_key, client_credentials                  |

Email method covers password and magic-link implementations in Task 2+.

## Deferred

- Real IdP network calls
- Permission/ACL enforcement beyond defaultRoles metadata
- Session revocation service
- Changes to authentication JSON Schema without versioning
