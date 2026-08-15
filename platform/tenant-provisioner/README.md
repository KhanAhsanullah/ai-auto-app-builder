# Tenant Provisioner

Control-plane service for tenant onboarding, seed data injection, and initial vertical template application.

## Package

`@ai-commerce/tenant-provisioner`

## Status

Sprint 4 Task 2 — vertical onboarding seeds, environment initialization, extended config builder pipeline.

## Modules

| Module                      | Responsibility                                                      |
| --------------------------- | ------------------------------------------------------------------- |
| `IdentityValidator`         | Validate provisioning request identity; generate UUID when omitted  |
| `ConfigBuilder`             | Build initial tenant-layer configuration document (`status: draft`) |
| `VerticalSeedLoader`        | Load and sanitize vertical onboarding seeds (internal)              |
| `EnvironmentBuilder`        | Build slug-derived environment settings (internal)                  |
| `TenantRepository`          | Persistence port for tenant registry records                        |
| `InMemoryTenantRepository`  | Map-backed in-memory repository adapter                             |
| `computeRequestFingerprint` | Deterministic request fingerprint for Task 3 idempotency            |

## Config Builder Pipeline (Task 2)

```
base tenant config
  → vertical seed (`modules/verticals/{vertical}/seeds/onboarding.template.json`)
  → configOverrides
  → environment assignment (slug-derived URLs)
  → enforceIdentityOnDocument
```

Identity fields always win over seed and override values. Platform and vertical runtime defaults are **not** copied into stored tenant config.

## Environment URLs (Task 2)

| Environment | API base URL                                |
| ----------- | ------------------------------------------- |
| development | `http://localhost:3000`                     |
| staging     | `https://api-staging.{slug}.platform.local` |
| production  | `https://api.{slug}.platform.local`         |

Provisioned tenants start with `environment.current = "development"`. Environment overrides are omitted during provisioning.

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Usage

```typescript
import {
  ConfigBuilder,
  IdentityValidator,
  InMemoryTenantRepository,
  computeRequestFingerprint,
} from '@ai-commerce/tenant-provisioner';

const validator = new IdentityValidator();
const builder = new ConfigBuilder();
const repository = new InMemoryTenantRepository();

const identity = validator.validate({
  slug: 'acme-market',
  name: 'Acme Market',
  vertical: 'ecommerce',
  defaultLocale: 'en',
  defaultTimezone: 'UTC',
});

const configDocument = builder.build(identity);
const fingerprint = computeRequestFingerprint(identity);
const timestamp = new Date().toISOString();

await repository.save({
  tenantId: identity.id,
  slug: identity.slug,
  status: 'draft',
  configDocument,
  requestFingerprint: fingerprint,
  createdAt: timestamp,
  updatedAt: timestamp,
});
```

## Documentation

- [Provisioning Schemas](../../schemas/provisioning/v1/README.md)
- [Vertical Seeds](../../modules/verticals/README.md)
