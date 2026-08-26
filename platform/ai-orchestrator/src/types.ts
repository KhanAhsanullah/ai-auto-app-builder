import type { AiSettings } from '@ai-commerce/config-schema';

/** Generation targets from the AI settings schema. */
export type AiGenerationTarget = AiSettings['generation']['allowedTargets'][number];

/** Copilot actions from the AI settings schema. */
export type AiCopilotAction = NonNullable<
  NonNullable<AiSettings['copilot']>['allowedActions']
>[number];

/** Lifecycle status of an AI proposal. */
export type AiProposalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'applied';

/** Result of authorizing an AI action against tenant guardrails. */
export interface AiAuthorizationDecision {
  allowed: boolean;
  /** Human review required before apply/publish. */
  requiresApproval: boolean;
  reason?: string;
}

/** Validated AI proposal awaiting review or apply. */
export interface AiProposal<TPayload = unknown> {
  id: string;
  target: AiGenerationTarget;
  status: AiProposalStatus;
  payload: TPayload;
  createdAt: number;
  requiresApproval: boolean;
  validation: {
    success: boolean;
    errors: readonly string[];
  };
  /** Dot-path fields touched by this proposal (for locked-field checks). */
  touchedFields?: readonly string[];
}

/** Input for creating a generation proposal. */
export interface CreateAiProposalInput {
  target: AiGenerationTarget;
  payload: unknown;
  touchedFields?: readonly string[];
  /** Override id (tests). */
  id?: string;
  /** Wall clock (tests). */
  now?: () => number;
}

/** Resolved guard policy derived from tenant AiSettings. */
export interface ResolvedAiGuardPolicy {
  enabled: boolean;
  providerName: AiSettings['provider']['name'];
  model?: string;
  allowedTargets: readonly AiGenerationTarget[];
  autoApply: boolean;
  maxTokensPerRequest: number;
  lockedFields: readonly string[];
  requireSchemaValidation: boolean;
  blockDirectDbWrites: boolean;
  auditAllSuggestions: boolean;
  copilot: {
    adminEnabled: boolean;
    customerSupportEnabled: boolean;
    allowedActions: readonly AiCopilotAction[];
  };
}
