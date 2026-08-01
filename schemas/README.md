# Schemas

Canonical schema definitions that serve as the single contract across the platform.

## Schema Domains

| Domain           | Path                                    | Purpose                                    |
| ---------------- | --------------------------------------- | ------------------------------------------ |
| Tenant Config    | [tenant-config/](./tenant-config)       | Master tenant configuration document       |
| Theme            | [theme/](./theme)                       | Design tokens and brand styling            |
| Navigation       | [navigation/](./navigation)             | Admin and consumer navigation structures   |
| Feature Manifest | [feature-manifest/](./feature-manifest) | Module and feature activation declarations |
| Plugin Manifest  | [plugin-manifest/](./plugin-manifest)   | Third-party plugin registration contracts  |

## Usage

Schemas are consumed by:

- `packages/config-schema` — runtime validators
- `platform/config-engine` — publish-time validation
- `platform/ai-orchestrator` — AI output validation
- `tooling/config-linter` — pre-deploy checks

## Versioning

Schema changes follow semantic versioning. Breaking changes require migration paths and config version bumps.

## Status

Foundation scaffold — JSON Schema files in future sprints.
