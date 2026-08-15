# Tenant Provisioner

Control-plane service for tenant onboarding, seed data injection, and initial vertical template application.

## Package

`@ai-commerce/tenant-provisioner`

## Status

Sprint 4 Task 3 — `TenantProvisioner` facade, provisioning orchestration, activation workflow, Config Runtime integration tests.

## Modules

| Module                      | Responsibility                                                      |
| --------------------------- | ------------------------------------------------------------------- |
| `TenantProvisioner`         | Public facade for provision + activate workflows                    |
| `createTenantProvisioner`   | Factory with default repository and ConfigProvider wiring           |
| `IdentityValidator`         | Validate provisioning request identity; generate UUID when omitted  |
| `ConfigBuilder`             | Build initial tenant-layer configuration document (`status: draft`) |
| `ProvisioningService`       | Create + idempotency + validation gate (internal via `./internal`)  |
| `LifecycleService`          | Draft → active activation (internal via `./internal`)               |
| `VerticalSeedLoader`        | Load and sanitize vertical onboarding seeds (internal)              |
| `EnvironmentBuilder`        | Build slug-derived environment settings (internal)                  |
| `TenantRepository`          | Persistence port for tenant registry records                        |
| `InMemoryTenantRepository`  | Map-backed in-memory repository adapter                             |
| `computeRequestFingerprint` | Deterministic request fingerprint for idempotency                   |

## Provisioning Workflow

```
validate identity/request
  → build tenant config (Task 2 pipeline)
  → ConfigProvider validation boundary
  → repository.save()
  → return ProvisioningResult summary
```

Activation:

```
find tenant by tenantId
  → validate draft → active transition
  → ConfigProvider validation boundary
  → repository.update()
  → return ProvisioningResult summary
```

## Idempotency (D6)

| Scenario                               | Behavior                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| Same explicit `id` + identical request | Idempotent success (`created: false`)                                          |
| Same `id` + different request          | `TenantAlreadyExistsException`                                                 |
| Same `slug`, different `id`            | `TenantAlreadyExistsException`                                                 |
| Retry without explicit `id`            | **Not guaranteed** — supply a stable explicit `id` for retry-safe provisioning |

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Usage

```typescript
import { createTenantProvisioner } from '@ai-commerce/tenant-provisioner';

const provisioner = createTenantProvisioner();

const created = await provisioner.provision({
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'acme-market',
  name: 'Acme Market',
  vertical: 'ecommerce',
  defaultLocale: 'en',
  defaultTimezone: 'UTC',
});

const activated = await provisioner.activate({ tenantId: created.tenantId });

const record = await provisioner.findById(created.tenantId);
```

Retrieve the full stored tenant-layer document via `findById()` / `findBySlug()`. Resolve runtime configuration through `@ai-commerce/config-runtime` `ConfigProvider`.

## Documentation

- [Tenant Provisioning Architecture](../../docs/architecture/tenant-provisioning.md)
- [Provisioning Schemas](../../schemas/provisioning/v1/README.md)
- [Vertical Seeds](../../modules/verticals/README.md)
