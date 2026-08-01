# Tenant Config Schema

JSON Schema definitions for the master tenant configuration document.

## Scope

Defines the top-level configuration structure:

- `tenant` — identity, vertical, locales
- `branding` — theme engine input
- `features` — enabled modules and flags
- `navigation` — cross-surface navigation
- `catalog`, `commerce`, `payments`, `notifications`, `integrations`
- `plugins`, `environments`

## Consumers

- Config Engine (validation on publish)
- Config Runtime (resolution rules)
- AI Orchestrator (generation output validation)
- All generated app surfaces (runtime behavior)

## Status

Schema files will be added in a future sprint.
