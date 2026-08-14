# Schemas

Canonical schema definitions — the **single contract** across the entire platform.

## Schema Domains

| Domain           | Path                                     | Purpose                                                   |
| ---------------- | ---------------------------------------- | --------------------------------------------------------- |
| Shared           | [shared/v1/](./shared/v1/)               | Common primitives (UUID, locale, currency) and versioning |
| Tenant Config    | [tenant-config/v1/](./tenant-config/v1/) | Master tenant configuration document                      |
| Theme            | [theme/v1/](./theme/v1/)                 | Design tokens and brand styling                           |
| Navigation       | [navigation/v1/](./navigation/v1/)       | Admin and consumer navigation structures                  |
| Feature Manifest | [feature-manifest/](./feature-manifest)  | Module and feature activation declarations                |
| Plugin Manifest  | [plugin-manifest/](./plugin-manifest)    | Third-party plugin registration contracts                 |
| White Label      | [white-label/v1/](./white-label/v1/)     | Brand resolver presets and resolved-brand documentation   |

## Documentation

| Document                                           | Description                                 |
| -------------------------------------------------- | ------------------------------------------- |
| [Schema References](./docs/SCHEMA-REFERENCES.md)   | How schemas reference each other via `$ref` |
| [Versioning](./docs/VERSIONING.md)                 | Schema version vs config version            |
| [Migration Strategy](./docs/MIGRATION-STRATEGY.md) | Future version migration pipeline           |

## Consumers

- `@ai-commerce/config-schema` — generated TypeScript types and Zod validators
- `platform/config-engine` — publish-time validation (future sprint)
- `platform/ai-orchestrator` — AI output validation (future sprint)
- `tooling/config-linter` — pre-deploy checks (future sprint)

## Code Generation

```bash
pnpm --filter @ai-commerce/config-schema generate
```

## Version

Current active schema version: **v1**
