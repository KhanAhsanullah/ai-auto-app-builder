# Config Schema

Canonical JSON Schema definitions, generated TypeScript interfaces, and Zod validators for tenant configuration.

**Single contract** used by Config Engine, AI Module, and all client surfaces.

## Package

`@ai-commerce/config-schema`

## Source of Truth

JSON Schema files live in the monorepo `schemas/` directory:

```
schemas/
├── shared/v1/           # Common primitives and versioning
├── tenant-config/v1/    # Domain schemas + root document
├── theme/v1/            # Design tokens
├── navigation/v1/       # Cross-surface navigation
└── docs/                # References, versioning, migrations
```

This package **generates** TypeScript and Zod from those schemas. It does not contain runtime config resolution logic (see `@ai-commerce/config-runtime` in a future sprint).

## Generated Outputs

| Output                | Path                     | Tool                        |
| --------------------- | ------------------------ | --------------------------- |
| TypeScript interfaces | `src/generated/types.ts` | `json-schema-to-typescript` |
| Zod validators        | `src/generated/zod.ts`   | `json-schema-to-zod`        |

## Usage

```bash
# Regenerate types and Zod validators after schema changes
pnpm --filter @ai-commerce/config-schema generate

# Typecheck (runs generate first)
pnpm --filter @ai-commerce/config-schema typecheck
```

```typescript
import {
  tenantConfigurationSchema,
  type TenantConfiguration,
  SCHEMA_VERSION,
} from '@ai-commerce/config-schema';

// Validate unknown input (no runtime engine — schema validation only)
const result = tenantConfigurationSchema.safeParse(input);
```

## Schema Domains

| Domain          | Schema File                            | Zod Export                     |
| --------------- | -------------------------------------- | ------------------------------ |
| Root            | `tenant-config.schema.json`            | `tenantConfigurationSchema`    |
| Meta            | `meta.schema.json`                     | `configurationMetaSchema`      |
| Tenant          | `tenant.schema.json`                   | `tenantSchema`                 |
| Company         | `company.schema.json`                  | `companySchema`                |
| Branding        | `branding.schema.json`                 | `brandingSchema`               |
| Theme           | `theme.schema.json`                    | `themeSchema`                  |
| Navigation      | `navigation.schema.json`               | `navigationSchema`             |
| Languages       | `languages.schema.json`                | `languagesSchema`              |
| Currency        | `currency.schema.json`                 | `currencySchema`               |
| Feature Flags   | `feature-flags.schema.json`            | `featureFlagsSchema`           |
| Authentication  | `authentication.schema.json`           | `authenticationSchema`         |
| Payments        | `payments.schema.json`                 | `paymentsSchema`               |
| Notifications   | `notifications.schema.json`            | `notificationsSchema`          |
| Integrations    | `integrations.schema.json`             | `integrationsSchema`           |
| AI Settings     | `ai-settings.schema.json`              | `aiSettingsSchema`             |
| Mobile App      | `mobile-app-settings.schema.json`      | `mobileAppSettingsSchema`      |
| Web Store       | `web-store-settings.schema.json`       | `webStoreSettingsSchema`       |
| Admin Dashboard | `admin-dashboard-settings.schema.json` | `adminDashboardSettingsSchema` |
| Environment     | `environment-settings.schema.json`     | `environmentSettingsSchema`    |

## Documentation

- [Schema References](../../schemas/docs/SCHEMA-REFERENCES.md)
- [Versioning](../../schemas/docs/VERSIONING.md)
- [Migration Strategy](../../schemas/docs/MIGRATION-STRATEGY.md)
- [Full Example](../../schemas/tenant-config/v1/examples/full.example.json)

## Version

Current schema version: **v1** (`SCHEMA_VERSION` constant)
