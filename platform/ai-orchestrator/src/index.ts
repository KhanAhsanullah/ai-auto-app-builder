export { AiActionGuard } from './domain/ai-action-guard.js';
export { createAiGuardContext } from './domain/create-ai-guard-context.js';
export type { AiGuardContext } from './domain/create-ai-guard-context.js';
export { AiGuardPolicyResolver } from './domain/ai-guard-policy-resolver.js';
export { AiOutputValidator } from './domain/ai-output-validator.js';
export type { AiValidationResult } from './domain/ai-output-validator.js';
export { AiProposalFactory } from './domain/ai-proposal-factory.js';
export { StubAiProvider } from './domain/ai-provider.js';
export type { AiProvider } from './domain/ai-provider.js';
export { toAiSettings, type AiSettingsConfigSource } from './domain/map-ai-settings.js';
export { buildGenerationPrompt } from './domain/ai-generation-prompts.js';
export type {
  AdapterGenerationTarget,
  CatalogEnrichmentBrief,
  ConfigGenerationBrief,
  GenerationPrompt,
  ThemeGenerationBrief,
} from './domain/ai-generation-prompts.js';
export { inferTouchedFields } from './domain/infer-touched-fields.js';
export { parseProviderJson } from './domain/parse-provider-json.js';
export {
  CatalogGenerationAdapter,
  ConfigGenerationAdapter,
  createGenerationAdapters,
  ThemeGenerationAdapter,
} from './domain/generation-adapters.js';
export type { GenerationAdapterOptions, GenerationAdapters } from './domain/generation-adapters.js';
export { AiOrchestrator } from './domain/ai-orchestrator.js';
export type { AiOrchestratorDeps } from './domain/ai-orchestrator.js';
export { createAiOrchestrator } from './domain/create-ai-orchestrator.js';
export type { CreateAiOrchestratorOptions } from './domain/create-ai-orchestrator.js';
export {
  AiActionForbiddenException,
  AiOrchestratorException,
  AiProviderResponseException,
  AiValidationException,
} from './errors.js';
export type {
  AiAuthorizationDecision,
  AiCopilotAction,
  AiGenerationTarget,
  AiProposal,
  AiProposalStatus,
  CreateAiProposalInput,
  ResolvedAiGuardPolicy,
} from './types.js';
export type { AiSettings } from '@ai-commerce/config-schema';
