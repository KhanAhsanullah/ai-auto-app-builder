# AI Orchestrator

Control-plane service for AI-driven config generation, theme creation, catalog enrichment, and guarded admin copilot actions.

## Package

`@ai-commerce/ai-orchestrator`

## Status

**Sprint 10 Task 2** — Generation adapters (config / theme / catalog) via `AiProvider`.

Task 1 (guardrails + proposals) is complete. Task 3 (`createAiOrchestrator` facade) is next.

## What this package does

AI generates **config proposals**, not architecture. Every action is gated by tenant `aiSettings` and validated against `@ai-commerce/config-schema` Zod schemas before it can be reviewed or applied.

## API

| Export                          | Role                                                                    |
| ------------------------------- | ----------------------------------------------------------------------- |
| `createAiGuardContext`          | Wire policy + guard + validator + proposal factory from `AiSettings`    |
| `createGenerationAdapters`      | Config / theme / catalog adapters over `AiProvider` → `AiProposal`      |
| `toAiSettings`                  | Map raw settings / tenant config / Config Runtime result → `AiSettings` |
| `AiGuardPolicyResolver`         | Resolve enabled targets, locked fields, copilot gates                   |
| `AiActionGuard`                 | Authorize generation/copilot; block locked-field writes                 |
| `AiOutputValidator`             | Schema-bound validation                                                 |
| `AiProposalFactory`             | Build reviewable proposals                                              |
| `StubAiProvider` / `AiProvider` | Provider port + deterministic stub                                      |

## Usage

```ts
import {
  createAiGuardContext,
  createGenerationAdapters,
  toAiSettings,
  StubAiProvider,
} from '@ai-commerce/ai-orchestrator';

const settings = toAiSettings(configProviderResult);
const ctx = createAiGuardContext(settings);
const adapters = createGenerationAdapters({
  provider: new StubAiProvider(/* or live provider */),
  proposals: ctx.proposals,
  policy: ctx.policy,
});

const themeProposal = await adapters.theme.generate({
  brandName: 'Fresh Mart',
  styleKeywords: ['fresh', 'green'],
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/ai-orchestrator test
pnpm --filter @ai-commerce/ai-orchestrator typecheck
pnpm --filter @ai-commerce/ai-orchestrator lint
```

## Architecture

See [docs/architecture/ai-orchestrator.md](../../docs/architecture/ai-orchestrator.md).
