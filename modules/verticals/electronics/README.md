# Electronics Vertical

Vertical pack for spec sheets, warranties, and compatibility matrices. Structured attributes and product comparison.

## Package

`@ai-commerce/vertical-electronics`

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
