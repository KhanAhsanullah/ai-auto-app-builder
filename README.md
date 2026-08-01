# AI White-Label Commerce Platform

Production monorepo for a configuration-driven, multi-tenant white-label commerce SaaS platform.

## Architecture

This repository follows the approved platform architecture:

- **apps/** — Deployable client and server applications
- **packages/** — Shared libraries consumed across all surfaces
- **modules/** — Domain feature modules (core + verticals)
- **platform/** — Control-plane services (config, theme, AI, provisioning)
- **schemas/** — Canonical JSON Schema definitions
- **tooling/** — CLI, generators, and lint utilities
- **infra/** — Infrastructure as code
- **docs/** — Architecture docs, ADRs, and vertical guides

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting Started

```bash
pnpm install
pnpm typecheck
pnpm lint
```

## Scripts

| Script              | Description                      |
| ------------------- | -------------------------------- |
| `pnpm build`        | Build all packages via Turborepo |
| `pnpm dev`          | Start development servers        |
| `pnpm lint`         | Lint all workspaces              |
| `pnpm typecheck`    | Type-check all workspaces        |
| `pnpm format`       | Format code with Prettier        |
| `pnpm format:check` | Check formatting                 |

## Conventions

- **Configuration-driven** — Runtime behavior is driven by tenant config, not hardcoded logic
- **Clean Architecture** — Domain → Application → Infrastructure separation in modules
- **Feature-first** — Vertical and core features live in isolated modules
- **Conventional Commits** — Enforced via Commitlint and Husky

## License

Proprietary — All rights reserved.
