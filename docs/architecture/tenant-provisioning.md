# Tenant Provisioning Architecture

Control-plane onboarding for new tenants in CommerceOS AI.

## Overview

The Tenant Provisioner (`@ai-commerce/tenant-provisioner`) creates tenant identity, builds the initial tenant-layer configuration document, validates it through Config Runtime, persists a registry record, and supports explicit activation from `draft` to `active`.

It does **not** own ongoing configuration CRUD, versioning, publish events, or downstream brand/theme compilation — those belong to Config Engine and the Theme/White Label engines respectively.

## Boundaries

```
Caller (CLI, tests, future platform-api)
        ↓
TenantProvisioner
        ↓
ProvisioningService / LifecycleService
        ↓
IdentityValidator + ConfigBuilder
        ↓
ConfigProvider.resolve()          ← validation gate
        ↓
TenantRepository
        ↓
InMemoryTenantRepository (default)
```

| Concern                                  | Owner                                          |
| ---------------------------------------- | ---------------------------------------------- |
| Initial tenant + config creation         | Tenant Provisioner                             |
| Platform/vertical merge + Zod validation | Config Runtime (`ConfigProvider`)              |
| Brand/theme artifact compilation         | WhiteLabelProvider / ThemeProvider (consumers) |
| Config updates, versioning, publish      | Config Engine (future)                         |

## Sprint 4 Task Breakdown

| Task   | Deliverable                                                              |
| ------ | ------------------------------------------------------------------------ |
| Task 1 | Identity validation, base config builder, repository port, fingerprint   |
| Task 2 | Vertical onboarding seeds, environment initialization                    |
| Task 3 | `TenantProvisioner` facade, activation, integration tests, result schema |

## Config Builder Pipeline (Task 2)

```
base tenant config
  → vertical seed
  → configOverrides
  → environment assignment (slug-derived URLs)
  → enforceIdentityOnDocument
```

Stored documents are **tenant layers only**. Platform and vertical runtime defaults are applied at resolve time by `ConfigProvider`.

## Provisioning Flow (Task 3)

1. Validate `ProvisioningRequest` (`provisioningRequestSchema` + `tenantSchema`)
2. Idempotency checks against registry (`tenantId`, then `slug`)
3. Build tenant-layer config via `ConfigBuilder`
4. Validate resolved configuration via `ConfigProvider.resolve()`
5. Persist registry record (`status: draft`)
6. Return `ProvisioningResult` summary (no embedded `configDocument`)

## Activation Flow (Task 3)

1. Load tenant by `tenantId`
2. If already `active` → idempotent success
3. If not `draft` → `InvalidLifecycleTransitionException`
4. Update config document `tenant.status` to `active`
5. Validate via `ConfigProvider.resolve()`
6. Persist via `TenantRepository.update()`

## Idempotency

Fingerprint: SHA-256 over canonical identity + optional `configOverrides` (see `computeRequestFingerprint`).

**Retry-safe provisioning requires an explicit stable `id`.** Retries without `id` generate a new UUID and will conflict on slug.

## Schemas

| Schema                             | Purpose                 |
| ---------------------------------- | ----------------------- |
| `provisioning-request.schema.json` | Input contract          |
| `provisioning-result.schema.json`  | Output summary contract |

## Deferred

- HTTP API (`apps/platform-api`)
- Database repository adapters
- Config Engine publish/version lifecycle
- `suspended` / `archived` transitions
- Kubernetes/cloud/storage namespaces
