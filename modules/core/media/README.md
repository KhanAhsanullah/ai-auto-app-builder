# Media Module

Core domain module for file upload, CDN URL generation, and image transformations. Shared asset pipeline for catalog and branding.

## Package

`@ai-commerce/module-media`

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
