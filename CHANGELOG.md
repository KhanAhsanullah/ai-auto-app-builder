# Changelog

All notable changes to CommerceOS AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Sprint 2 — Theme Engine
- Sprint 3 — White Label Engine

---

## [0.1.0] — 2026-08-02

Sprint 1 complete. Monorepo foundation, configuration schema, and configuration runtime.

### Added

- **Monorepo foundation** (Sprint 1 Task 1)
  - Turborepo monorepo with pnpm workspaces
  - ESLint, Prettier, Husky, Commitlint tooling
  - Package scaffolds: apps, packages, modules, platform, schemas, tooling, infra
  - Approved architecture layout documented in `docs/architecture/`

- **Configuration schema** (Sprint 1 Task 2) — `@ai-commerce/config-schema`
  - JSON Schema contracts in `schemas/tenant-config/v1/` (18+ domain schemas)
  - Generated TypeScript interfaces and Zod validators
  - Schema versioning, references, and migration documentation
  - Tag: `sprint1-task2`

- **Configuration runtime** (Sprint 1 Task 3) — `@ai-commerce/config-runtime`
  - `ConfigLoader` — parse JSON strings, objects, and files
  - `ConfigResolver` — merge inheritance chain with deep merge
  - `ConfigValidator` — validate against Zod schemas
  - `ConfigCache` — in-memory LRU cache with optional TTL
  - `ConfigProvider` — facade combining load → resolve → validate → cache
  - Platform and vertical default presets
  - Full test suite with Vitest
  - Tag: `sprint1-task3`

- **Documentation**
  - `PROJECT_STATUS.md` — project status tracker
  - `PRODUCT_VISION.md` — vision, mission, and roadmap
  - `ARCHITECTURE_RULES.md` — permanent architectural rules
  - `SPRINT_BOARD.md` — sprint roadmap
  - `CONTRIBUTING.md` — contribution guidelines
  - `AGENTS.md` — AI assistant guidelines
  - `CHANGELOG.md` — version history

### Infrastructure

- Node.js >= 20, pnpm >= 9, TypeScript 5.7
- Conventional Commits enforced via Commitlint

---

## Version History

| Version | Sprint   | Tag             | Commit    | Description                                          |
| ------- | -------- | --------------- | --------- | ---------------------------------------------------- |
| 0.1.0   | Sprint 1 | `sprint1-task3` | `162fab4` | Monorepo foundation + config schema + config runtime |

[Unreleased]: https://github.com/your-org/ai-commerce-platform/compare/sprint1-task3...HEAD
[0.1.0]: https://github.com/your-org/ai-commerce-platform/releases/tag/sprint1-task3
