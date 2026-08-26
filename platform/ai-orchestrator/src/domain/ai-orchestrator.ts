import type {
  AiAuthorizationDecision,
  AiCopilotAction,
  AiGenerationTarget,
  AiProposal,
  CreateAiProposalInput,
  ResolvedAiGuardPolicy,
} from '../types.js';
import type { AiActionGuard } from './ai-action-guard.js';
import type {
  CatalogEnrichmentBrief,
  ConfigGenerationBrief,
  ThemeGenerationBrief,
} from './ai-generation-prompts.js';
import type { GenerationAdapters } from './generation-adapters.js';
import type { AiProposalFactory } from './ai-proposal-factory.js';
import type { AiProvider } from './ai-provider.js';

export interface AiOrchestratorDeps {
  policy: ResolvedAiGuardPolicy;
  guard: AiActionGuard;
  proposals: AiProposalFactory;
  adapters: GenerationAdapters;
  provider: AiProvider;
}

/**
 * Public facade for AI control-plane operations:
 * guarded generation, schema-bound proposals, and copilot authorization.
 */
export class AiOrchestrator {
  constructor(private readonly deps: AiOrchestratorDeps) {}

  /** Resolved tenant AI guard policy. */
  getPolicy(): ResolvedAiGuardPolicy {
    return this.deps.policy;
  }

  /** Underlying LLM / model provider id. */
  getProviderId(): string {
    return this.deps.provider.id;
  }

  /** Authorize a generation target without throwing. */
  authorizeGeneration(target: AiGenerationTarget): AiAuthorizationDecision {
    return this.deps.guard.authorizeGeneration(target);
  }

  /** Authorize an admin/customer copilot action without throwing. */
  authorizeCopilot(
    action: AiCopilotAction,
    surface: 'admin' | 'customer_support' = 'admin',
  ): AiAuthorizationDecision {
    return this.deps.guard.authorizeCopilot(action, surface);
  }

  /** Throw when a copilot action is forbidden. */
  requireCopilot(
    action: AiCopilotAction,
    surface: 'admin' | 'customer_support' = 'admin',
  ): AiAuthorizationDecision {
    return this.deps.guard.requireCopilot(action, surface);
  }

  /** Create a proposal from a caller-supplied payload (no live provider call). */
  createProposal(input: CreateAiProposalInput): AiProposal {
    return this.deps.proposals.create(input);
  }

  /** Generate a config-patch proposal from a business brief. */
  generateConfig(brief: ConfigGenerationBrief): Promise<AiProposal> {
    return this.deps.adapters.config.generate(brief);
  }

  /** Generate a theme proposal from a brand/style brief. */
  generateTheme(brief: ThemeGenerationBrief): Promise<AiProposal> {
    return this.deps.adapters.theme.generate(brief);
  }

  /** Generate a catalog enrichment proposal. */
  enrichCatalog(brief: CatalogEnrichmentBrief): Promise<AiProposal> {
    return this.deps.adapters.catalog.generate(brief);
  }
}
