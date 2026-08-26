# AI Orchestrator

Control-plane service for AI-driven config generation, theme creation, catalog enrichment, and guarded admin copilot actions.

## Package

`@ai-commerce/ai-orchestrator`

## Status

**Sprint 10 Task 1** — Guardrails + schema-bound proposals foundation (no live LLM).

## What this package does

AI generates **config proposals**, not architecture. Every action is gated by tenant `aiSettings` and validated against `@ai-commerce/config-schema` Zod schemas before it can be reviewed or applied.

## Task 1 API

| Export                          | Role                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `createAiGuardContext`          | Wire policy + guard + validator + proposal factory from `AiSettings`           |
| `toAiSettings`                  | Map raw settings / tenant config / Config Runtime result → `AiSettings`        |
| `AiGuardPolicyResolver`         | Resolve enabled targets, locked fields, copilot gates                          |
| `AiActionGuard`                 | Authorize generation/copilot; block locked-field writes                        |
| `AiOutputValidator`             | Schema-bound validation (`theme`, `navigation`, `copy`, config patch, catalog) |
| `AiProposalFactory`             | Build `AiProposal` under guardrails (pending approval unless `autoApply`)      |
| `StubAiProvider` / `AiProvider` | Provider port + deterministic stub (live adapters in Task 2)                   |

## Usage

```ts
import { createAiGuardContext, toAiSettings, StubAiProvider } from '@ai-commerce/ai-orchestrator';

const settings = toAiSettings(configProviderResult);
const { proposals, guard } = createAiGuardContext(settings);

guard.requireCopilot('read_catalog');

const proposal = proposals.create({
  target: 'theme',
  payload: themeJson,
  touchedFields: ['theme.colors.primary'],
});
// proposal.status === 'pending_approval' when generation.autoApply is false
```

## Scripts

```bash
pnpm --filter @ai-commerce/ai-orchestrator test
pnpm --filter @ai-commerce/ai-orchestrator typecheck
pnpm --filter @ai-commerce/ai-orchestrator lint
```

## Architecture

See [docs/architecture/ai-orchestrator.md](../../docs/architecture/ai-orchestrator.md).
