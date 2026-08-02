# Tenant Configuration Schema (v1)

Canonical JSON Schema definitions for the master tenant configuration document — the **single source of truth** for the entire platform.

## Root Schema

| File                                                     | Description                                |
| -------------------------------------------------------- | ------------------------------------------ |
| [tenant-config.schema.json](./tenant-config.schema.json) | Root document composing all domain schemas |

## Domain Schemas

| Schema          | File                                                                                     | Example                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Meta            | [meta.schema.json](./meta.schema.json)                                                   | [examples/meta.example.json](./examples/meta.example.json)                                                   |
| Tenant          | [tenant.schema.json](./tenant.schema.json)                                               | [examples/tenant.example.json](./examples/tenant.example.json)                                               |
| Company         | [company.schema.json](./company.schema.json)                                             | [examples/company.example.json](./examples/company.example.json)                                             |
| Branding        | [branding.schema.json](./branding.schema.json)                                           | [examples/branding.example.json](./examples/branding.example.json)                                           |
| Theme           | [../../theme/v1/theme.schema.json](../../theme/v1/theme.schema.json)                     | [../../theme/v1/examples/theme.example.json](../../theme/v1/examples/theme.example.json)                     |
| Navigation      | [../../navigation/v1/navigation.schema.json](../../navigation/v1/navigation.schema.json) | [../../navigation/v1/examples/navigation.example.json](../../navigation/v1/examples/navigation.example.json) |
| Languages       | [languages.schema.json](./languages.schema.json)                                         | [examples/languages.example.json](./examples/languages.example.json)                                         |
| Currency        | [currency.schema.json](./currency.schema.json)                                           | [examples/currency.example.json](./examples/currency.example.json)                                           |
| Feature Flags   | [feature-flags.schema.json](./feature-flags.schema.json)                                 | [examples/feature-flags.example.json](./examples/feature-flags.example.json)                                 |
| Authentication  | [authentication.schema.json](./authentication.schema.json)                               | [examples/authentication.example.json](./examples/authentication.example.json)                               |
| Payments        | [payments.schema.json](./payments.schema.json)                                           | [examples/payments.example.json](./examples/payments.example.json)                                           |
| Notifications   | [notifications.schema.json](./notifications.schema.json)                                 | [examples/notifications.example.json](./examples/notifications.example.json)                                 |
| Integrations    | [integrations.schema.json](./integrations.schema.json)                                   | [examples/integrations.example.json](./examples/integrations.example.json)                                   |
| AI Settings     | [ai-settings.schema.json](./ai-settings.schema.json)                                     | [examples/ai-settings.example.json](./examples/ai-settings.example.json)                                     |
| Mobile App      | [mobile-app-settings.schema.json](./mobile-app-settings.schema.json)                     | [examples/mobile-app-settings.example.json](./examples/mobile-app-settings.example.json)                     |
| Web Store       | [web-store-settings.schema.json](./web-store-settings.schema.json)                       | [examples/web-store-settings.example.json](./examples/web-store-settings.example.json)                       |
| Admin Dashboard | [admin-dashboard-settings.schema.json](./admin-dashboard-settings.schema.json)           | [examples/admin-dashboard-settings.example.json](./examples/admin-dashboard-settings.example.json)           |
| Environment     | [environment-settings.schema.json](./environment-settings.schema.json)                   | [examples/environment-settings.example.json](./examples/environment-settings.example.json)                   |

## Full Example

Complete valid tenant configuration: [examples/full.example.json](./examples/full.example.json)

## Documentation

| Document                                               | Description                       |
| ------------------------------------------------------ | --------------------------------- |
| [Schema References](../../docs/SCHEMA-REFERENCES.md)   | How schemas compose via `$ref`    |
| [Versioning](../../docs/VERSIONING.md)                 | Schema vs config version strategy |
| [Migration Strategy](../../docs/MIGRATION-STRATEGY.md) | Future version migration pipeline |

## Code Generation

TypeScript interfaces and Zod validators are generated by `@ai-commerce/config-schema`:

```bash
pnpm --filter @ai-commerce/config-schema generate
```

## Validation Rules

Every schema enforces:

- **Required fields** — minimum viable configuration per domain
- **Type constraints** — strict types, no coercion
- **Pattern validation** — slugs, locales, currencies, phone numbers, URLs
- **Enum constraints** — verticals, gateways, environments, tiers
- **`additionalProperties: false`** — reject unknown keys at root and domain level

## Version

Current schema version: **v1**
