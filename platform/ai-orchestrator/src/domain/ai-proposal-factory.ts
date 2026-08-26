import { randomUUID } from 'node:crypto';

import { AiValidationException } from '../errors.js';
import type { AiProposal, CreateAiProposalInput, ResolvedAiGuardPolicy } from '../types.js';
import type { AiActionGuard } from './ai-action-guard.js';
import type { AiOutputValidator } from './ai-output-validator.js';

/**
 * Builds schema-validated AI proposals under tenant guardrails.
 * Does not call live LLMs — callers supply payload (or use AiProvider separately).
 */
export class AiProposalFactory {
  constructor(
    private readonly guard: AiActionGuard,
    private readonly validator: AiOutputValidator,
    private readonly policy: ResolvedAiGuardPolicy,
  ) {}

  create(input: CreateAiProposalInput): AiProposal {
    const decision = this.guard.requireGeneration(input.target);

    if (input.touchedFields && input.touchedFields.length > 0) {
      this.guard.assertNoLockedFieldWrites(input.touchedFields);
    }

    let validation = { success: true, errors: [] as readonly string[] };
    if (this.policy.requireSchemaValidation) {
      validation = this.validator.validate(input.target, input.payload);
      if (!validation.success) {
        throw new AiValidationException(validation.errors);
      }
    }

    const now = input.now ?? (() => Date.now());
    const requiresApproval = decision.requiresApproval;

    return {
      id: input.id ?? randomUUID(),
      target: input.target,
      status: requiresApproval ? 'pending_approval' : 'approved',
      payload: input.payload,
      createdAt: now(),
      requiresApproval,
      validation,
      ...(input.touchedFields ? { touchedFields: input.touchedFields } : {}),
    };
  }
}
