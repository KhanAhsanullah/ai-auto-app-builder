# Inventory Module

Core domain module for stock levels, reservations, and multi-location inventory. Supports retail and capacity-based verticals.

## Package

`@ai-commerce/module-inventory`

## Status

Foundation scaffold — no business logic implemented yet.

## Clean Architecture Layers

| Layer          | Path              | Responsibility                             |
| -------------- | ----------------- | ------------------------------------------ |
| Domain         | `domain/`         | Entities, value objects, domain invariants |
| Application    | `application/`    | Use cases, commands, queries               |
| Infrastructure | `infrastructure/` | Database repositories, external adapters   |
| API            | `api/`            | Thin HTTP/GraphQL handlers                 |
| Events         | `events/`         | Published domain events                    |

## Manifest

Module capabilities and hook registrations are declared in `manifest.json`.

## Scripts

```bash
pnpm lint
pnpm typecheck
```
