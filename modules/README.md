# Modules

Domain feature modules implementing commerce business capabilities.

## Structure

```
modules/
├── core/       # Always-on domain modules (every tenant)
└── verticals/  # Optional vertical packs (business-type specific)
```

## Core Modules

Universal commerce primitives required by every tenant regardless of vertical.

See [core/README.md](./core/README.md) for the full list.

## Vertical Modules

Business-type extensions that plug into core via configuration, hooks, and schema extensions.

See [verticals/README.md](./verticals/README.md) for supported verticals.

## Module Architecture

Each module follows **Clean Architecture** with **Feature-First** organization:

- `domain/` — Entities and business rules
- `application/` — Use cases
- `infrastructure/` — Persistence and external services
- `api/` — Thin transport handlers
- `events/` — Domain events

## Status

Foundation scaffold — domain logic in future sprints.
