import { createAiGuardContext } from './create-ai-guard-context.js';
import { createGenerationAdapters } from './generation-adapters.js';
import { AiOrchestrator } from './ai-orchestrator.js';
import { StubAiProvider, type AiProvider } from './ai-provider.js';
import { toAiSettings, type AiSettingsConfigSource } from './map-ai-settings.js';

export interface CreateAiOrchestratorOptions {
  /** Raw AiSettings, tenant config, or ConfigProvider result. */
  settings: AiSettingsConfigSource;
  /** LLM provider (defaults to StubAiProvider). */
  provider?: AiProvider;
  /** Override proposal id (tests). */
  proposalId?: string;
  /** Wall clock (tests). */
  now?: () => number;
}

/**
 * Wire an AiOrchestrator from tenant AI settings and an optional provider.
 */
export function createAiOrchestrator(options: CreateAiOrchestratorOptions): AiOrchestrator {
  const settings = toAiSettings(options.settings);
  const ctx = createAiGuardContext(settings);
  const provider = options.provider ?? new StubAiProvider();
  const adapters = createGenerationAdapters({
    provider,
    proposals: ctx.proposals,
    policy: ctx.policy,
    id: options.proposalId,
    now: options.now,
  });

  return new AiOrchestrator({
    policy: ctx.policy,
    guard: ctx.guard,
    proposals: ctx.proposals,
    adapters,
    provider,
  });
}
