# Pharmacy Vertical

Vertical pack for prescription uploads, compliance flags, and restricted product rules. Regulatory-aware catalog extensions.

## Package

`@ai-commerce/vertical-pharmacy`

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
