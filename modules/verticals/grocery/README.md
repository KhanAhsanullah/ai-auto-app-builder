# Grocery Vertical

Vertical pack for weighted items, delivery slots, and substitution rules. Extends catalog and checkout for perishable goods.

## Package

`@ai-commerce/vertical-grocery`

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
