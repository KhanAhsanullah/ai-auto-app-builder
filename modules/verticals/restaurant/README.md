# Restaurant Vertical

Vertical pack for menus, modifiers, kitchen routing, and table/delivery modes. Specialized order flow for food service.

## Package

`@ai-commerce/vertical-restaurant`

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
