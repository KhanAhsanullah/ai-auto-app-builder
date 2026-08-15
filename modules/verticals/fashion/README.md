# Fashion Vertical

Vertical pack for size charts, lookbooks, and fit attributes. Rich attribute model and discovery UX for apparel.

## Package

`@ai-commerce/vertical-fashion`

## Status

Foundation scaffold — onboarding seed available; business logic in future sprints.

## Vertical Structure

| Path                             | Responsibility                                 |
| -------------------------------- | ---------------------------------------------- |
| `hooks/`                         | Checkout, catalog, and pricing extension hooks |
| `seeds/onboarding.template.json` | Tenant provisioning onboarding config partial  |

## Manifests (future sprints)

- `config.extensions.json` — vertical-specific config keys
- `navigation.manifest.json` — admin and consumer navigation entries
- `screen-map.json` — route-to-screen mapping for generated apps

## Scripts

```bash
pnpm lint
pnpm typecheck
```
