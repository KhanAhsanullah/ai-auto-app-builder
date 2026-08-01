# Pharmacy Vertical

Vertical pack for prescription uploads, compliance flags, and restricted product rules. Regulatory-aware catalog extensions.

## Package

`@ai-commerce/vertical-pharmacy`

## Status

Foundation scaffold — no business logic implemented yet.

## Vertical Structure

| Path     | Responsibility                                       |
| -------- | ---------------------------------------------------- |
| `hooks/` | Checkout, catalog, and pricing extension hooks       |
| `seeds/` | Demo data templates for onboarding and AI generation |

## Manifests (future sprints)

- `config.extensions.json` — vertical-specific config keys
- `navigation.manifest.json` — admin and consumer navigation entries
- `screen-map.json` — route-to-screen mapping for generated apps

## Scripts

```bash
pnpm lint
pnpm typecheck
```
