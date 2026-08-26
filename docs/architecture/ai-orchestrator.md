# AI Orchestrator

Control-plane package (`@ai-commerce/ai-orchestrator`) for schema-bound AI proposals: config generation, theme creation, catalog enrichment, and guarded admin copilot actions.

## Principles

1. **AI generates config, not architecture** — output is tenant configuration / content patches, never monorepo structure.
2. **Schema-bound** — proposals validate against `@ai-commerce/config-schema` Zod schemas when `guardrails.requireSchemaValidation` is true.
3. **Tenant-guarded** — `aiSettings.enabled`, `generation.allowedTargets`, `guardrails.lockedFields`, and `copilot.*` gate every action.
4. **Human-in-the-loop by default** — `generation.autoApply: false` → proposals stay `pending_approval`.

## Sprint 10 Task 1 surface

```
AiSettings (tenant config.aiSettings)
        │
        ▼
AiGuardPolicyResolver → ResolvedAiGuardPolicy
        │
        ├─ AiActionGuard (authorize + locked fields)
        ├─ AiOutputValidator (Zod / patch shape)
        └─ AiProposalFactory → AiProposal
```

`AiProvider` is a port only in Task 1 (`StubAiProvider` for tests). Live generation adapters land in Task 2; the public facade (`createAiOrchestrator`) in Task 3.

## Locked fields

Dot-paths such as `payments.checkout.captureStrategy` cannot be written by AI. Matching is exact or prefix either direction (`payments` blocks nested payment writes; nested paths block the locked ancestor).

## Related config

- Schema: `schemas/tenant-config/v1/ai-settings.schema.json`
- Types: `AiSettings` from `@ai-commerce/config-schema`
- Tenant field: `TenantConfiguration.aiSettings`
