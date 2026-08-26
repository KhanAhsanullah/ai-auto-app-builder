# AI Orchestrator

Control-plane service for AI-driven config generation, theme creation, catalog enrichment, and guarded admin copilot actions.

## Package

`@ai-commerce/ai-orchestrator`

## Status

**Sprint 10 Task 3** complete — `AiOrchestrator` / `createAiOrchestrator` facade.

Sprint 10 (AI Commerce Engine) Tasks 1–3 are complete. HTTP service deferred.

## What this package does

AI generates **config proposals**, not architecture. Every action is gated by tenant `aiSettings` and validated against `@ai-commerce/config-schema` Zod schemas before it can be reviewed or applied.

## Public API

| Export                          | Role                                        |
| ------------------------------- | ------------------------------------------- |
| `createAiOrchestrator`          | Wire settings + provider → `AiOrchestrator` |
| `AiOrchestrator`                | Facade: generation, proposals, copilot auth |
| `createAiGuardContext`          | Lower-level guard/validator/proposal wiring |
| `createGenerationAdapters`      | Config / theme / catalog adapters           |
| `toAiSettings`                  | Map config sources → `AiSettings`           |
| `StubAiProvider` / `AiProvider` | Provider port + deterministic stub          |

## Usage

```ts
import { createAiOrchestrator, StubAiProvider } from '@ai-commerce/ai-orchestrator';

const ai = createAiOrchestrator({
  settings: configProviderResult, // or AiSettings / { aiSettings }
  provider: new StubAiProvider(/* or live provider */),
});

ai.requireCopilot('read_catalog');

const themeProposal = await ai.generateTheme({
  brandName: 'Fresh Mart',
  styleKeywords: ['fresh', 'green'],
});
// themeProposal.status === 'pending_approval' when autoApply is false
```

## Scripts

```bash
pnpm --filter @ai-commerce/ai-orchestrator test
pnpm --filter @ai-commerce/ai-orchestrator typecheck
pnpm --filter @ai-commerce/ai-orchestrator lint
```

## Architecture

See [docs/architecture/ai-orchestrator.md](../../docs/architecture/ai-orchestrator.md).
