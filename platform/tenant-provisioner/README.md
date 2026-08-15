# Tenant Provisioner

Control-plane service for tenant onboarding, seed data injection, and initial vertical template application.

## Package

`@ai-commerce/tenant-provisioner`

## Status

Sprint 4 Task 1 — tenant identity validation, initial config builder, repository port, in-memory repository, provisioning request schema.

## Modules (Task 1)

| Module                      | Responsibility                                                      |
| --------------------------- | ------------------------------------------------------------------- |
| `IdentityValidator`         | Validate provisioning request identity; generate UUID when omitted  |
| `ConfigBuilder`             | Build initial tenant-layer configuration document (`status: draft`) |
| `TenantRepository`          | Persistence port for tenant registry records                        |
| `InMemoryTenantRepository`  | Map-backed in-memory repository adapter                             |
| `computeRequestFingerprint` | Deterministic request fingerprint for Task 3 idempotency            |

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
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
