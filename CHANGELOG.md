# Changelog

All notable changes to CommerceOS AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **White-label asset pipeline** (Sprint 3 Task 2) — `@ai-commerce/white-label-engine`
  - Backward-compatible branding schema additions — optional `logo.appIcon` and `branding.fonts`
  - `AssetNormalizer` — canonical asset reference normalization with app icon fallback chain
  - `BrandCompiler` — manifest/reference-only compilation for web, mobile, and admin-dashboard surfaces
  - `BrandCache` — in-memory LRU cache keyed by asset hash and surfaces
  - Surface emitters — web link descriptors, mobile icon metadata, admin header/favicon references
  - Deterministic asset hash, extended brand hash for font assets, engine output schemas
  - Unit and Config Runtime integration tests

- **White-label brand foundation** (Sprint 3 Task 1) — `@ai-commerce/white-label-engine`
  - `BrandResolver` — platform → vertical → tenant → environment branding merge
  - Platform and vertical brand defaults (all six verticals)
  - `toResolveBrandInput` / `brandConfigSourceFromProviderResult` — Config Runtime mapping without re-resolution
  - Deterministic SHA-256 brand hash and layer audit metadata
  - Unit and Config Runtime integration tests
  - Platform scaffold renamed to `@ai-commerce/white-label-engine-service`

- **ThemeProvider facade** (Sprint 2 Task 3) — `@ai-commerce/theme-engine`
  - `ThemeProvider` — public facade for resolve + compile pipeline
  - `createThemeProvider` — factory with default resolver, compiler, cache, and emitters
  - `ThemeConfigSource` — structural type for Config Runtime integration without re-resolution
  - `toResolveThemeInput` — maps resolved config output to theme resolver input
  - Public API cleanup — stable exports via main entry; internals via `./internal`
  - Integration tests — ConfigProvider → ThemeProvider, cache, multi-tenant, presets, light/dark

- **Theme compiler & emitters** (Sprint 2 Task 2) — `@ai-commerce/theme-engine`
  - `TokenNormalizer` — canonical normalized design tokens from resolved themes
  - `ThemeCompiler` — orchestrates resolve → normalize → emit pipeline
  - `ThemeCache` — in-memory LRU cache for compiled artifacts
  - `CssVariablesEmitter` — CSS custom properties with light/dark mode support
  - `TailwindEmitter` — Tailwind theme extension configuration
  - `ReactNativeEmitter` — React Native theme objects per mode
  - `AdminDashboardTokenEmitter` — admin semantic tokens and CSS variables
  - Unit and snapshot tests for all compiler and emitter modules

### Planned

- Sprint 3 Task 3 — WhiteLabelProvider facade

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
