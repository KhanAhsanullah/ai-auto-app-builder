# Contributing

Guidelines for contributing to CommerceOS AI (`ai-commerce-platform`).

---

## Setup

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9

### Install

```bash
git clone <repository-url>
cd AI-App-Builder
pnpm install
```

### Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

### Development

```bash
pnpm dev      # Start development servers (Turborepo)
pnpm build    # Build all workspaces
```

### Workspace Packages

The monorepo uses pnpm workspaces defined in `pnpm-workspace.yaml`:

- `apps/*` — Deployable applications
- `packages/*` — Shared libraries
- `modules/core/*` — Core commerce modules
- `modules/verticals/*` — Vertical presets
- `platform/*` — Control-plane services
- `tooling/*` — CLI and generators

Run commands against a single package:

```bash
pnpm --filter @ai-commerce/config-runtime test
pnpm --filter @ai-commerce/config-schema generate
```

---

## Coding Standards

### Architecture

Follow [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md). Key points:

- Configuration-first — no hardcoded tenant or business values
- Clean Architecture in modules (Domain → Application → Infrastructure)
- SOLID principles
- Everything tenant-aware and configurable

### TypeScript

- Strict TypeScript — no `any` unless justified and documented
- Prefer explicit types for public APIs and config contracts
- Use generated types from `@ai-commerce/config-schema` for config shapes

### Formatting & Linting

- **Prettier** for formatting — run `pnpm format` before committing
- **ESLint** for lint rules — run `pnpm lint`
- Pre-commit hooks (Husky + lint-staged) enforce both automatically

### Module Conventions

- Each module must have a `README.md` documenting its purpose, config surface, and status
- Feature modules include a `manifest.json` describing capabilities
- Public APIs are exported from `src/index.ts`

### Documentation

- Feature modules must be documented before merge
- Significant decisions require an ADR in `docs/adr/`
- Update [CHANGELOG.md](./CHANGELOG.md) for user-facing changes

---

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/), enforced by Commitlint and Husky.

### Format

```
<type>(<scope>): <subject>

[optional body]
```

### Allowed Types

| Type       | Use                            |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting, no logic change    |
| `refactor` | Code change, no feature or fix |
| `perf`     | Performance improvement        |
| `test`     | Adding or updating tests       |
| `build`    | Build system or dependencies   |
| `ci`       | CI configuration               |
| `chore`    | Maintenance tasks              |
| `revert`   | Revert a previous commit       |

### Rules

- Subject must not use Start Case, Pascal Case, or UPPER CASE
- Header max length: 100 characters
- Reference sprint and task in subject when applicable:

```
feat(config-runtime): complete configuration runtime (Sprint 1 Task 3)
```

---

## Branch Strategy

| Branch               | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `main`               | Production-ready code; protected                |
| `sprint/{N}/{task}`  | Sprint task work (e.g. `sprint/2/theme-engine`) |
| `feat/{description}` | Feature branches off sprint branches            |
| `fix/{description}`  | Bug fixes                                       |
| `docs/{description}` | Documentation updates                           |

### Workflow

1. Branch from `main` (or active sprint branch) for your task
2. Keep commits atomic and conventionally formatted
3. Open a pull request against `main` (or sprint branch)
4. Ensure CI passes: typecheck, lint, test, format check
5. Squash or merge per team preference after review

---

## Testing Rules

### Requirements

- All new logic in `packages/` and `platform/` must include unit tests
- Config schema changes must include validation test cases
- Run the full test suite before opening a PR: `pnpm test`

### Test Framework

- **Vitest** for unit tests (see `packages/config-runtime/vitest.config.ts`)
- Test files live in `tests/` adjacent to source or co-located as `*.test.ts`

### What to Test

- Config resolution inheritance chains
- Schema validation (valid and invalid inputs)
- Edge cases in merge, cache, and provider logic
- Public API contracts

### What Not to Test

- Trivial getters/setters with no logic
- Generated code from schema tooling (test the generator inputs instead)
- Third-party library internals

---

## Definition of Done

A sprint task or feature is **done** when all of the following are true:

- [ ] Implementation complete and scoped to the sprint task
- [ ] Follows [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md)
- [ ] TypeScript compiles: `pnpm typecheck` passes
- [ ] Lint passes: `pnpm lint` passes
- [ ] Tests pass: `pnpm test` passes
- [ ] Formatting passes: `pnpm format:check` passes
- [ ] Module README updated with status and usage
- [ ] Config surface declared in JSON Schema (if applicable)
- [ ] Conventional Commit with sprint/task reference
- [ ] Git tag applied for sprint task completion (e.g. `sprint1-task3`)
- [ ] [PROJECT_STATUS.md](./PROJECT_STATUS.md) and [SPRINT_BOARD.md](./SPRINT_BOARD.md) updated
- [ ] [CHANGELOG.md](./CHANGELOG.md) updated for notable changes
- [ ] No modifications to completed sprint deliverables without approval

---

## Questions

Refer to [docs/architecture/README.md](./docs/architecture/README.md) for system architecture and [AGENTS.md](./AGENTS.md) for AI-assisted development guidelines.
