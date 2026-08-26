import { AiActionForbiddenException } from '../errors.js';
import type {
  AiAuthorizationDecision,
  AiCopilotAction,
  AiGenerationTarget,
  ResolvedAiGuardPolicy,
} from '../types.js';

/**
 * Enforces tenant AI guardrails: enabled switch, allowed targets/actions, locked fields.
 */
export class AiActionGuard {
  constructor(private readonly policy: ResolvedAiGuardPolicy) {}

  /** Authorize a generation target (config / theme / catalog / …). */
  authorizeGeneration(target: AiGenerationTarget): AiAuthorizationDecision {
    if (!this.policy.enabled) {
      return {
        allowed: false,
        requiresApproval: true,
        reason: 'AI features are disabled for this tenant.',
      };
    }

    if (!this.policy.allowedTargets.includes(target)) {
      return {
        allowed: false,
        requiresApproval: true,
        reason: `Generation target '${target}' is not allowed for this tenant.`,
      };
    }

    return {
      allowed: true,
      requiresApproval: !this.policy.autoApply,
    };
  }

  /** Authorize an admin/customer copilot action. */
  authorizeCopilot(
    action: AiCopilotAction,
    surface: 'admin' | 'customer_support' = 'admin',
  ): AiAuthorizationDecision {
    if (!this.policy.enabled) {
      return {
        allowed: false,
        requiresApproval: true,
        reason: 'AI features are disabled for this tenant.',
      };
    }

    if (surface === 'admin' && !this.policy.copilot.adminEnabled) {
      return {
        allowed: false,
        requiresApproval: true,
        reason: 'Admin copilot is disabled for this tenant.',
      };
    }

    if (surface === 'customer_support' && !this.policy.copilot.customerSupportEnabled) {
      return {
        allowed: false,
        requiresApproval: true,
        reason: 'Customer support copilot is disabled for this tenant.',
      };
    }

    if (!this.policy.copilot.allowedActions.includes(action)) {
      return {
        allowed: false,
        requiresApproval: true,
        reason: `Copilot action '${action}' is not allowed for this tenant.`,
      };
    }

    return {
      allowed: true,
      requiresApproval: !this.policy.autoApply,
    };
  }

  /** Throw when generation is not allowed. */
  requireGeneration(target: AiGenerationTarget): AiAuthorizationDecision {
    const decision = this.authorizeGeneration(target);
    if (!decision.allowed) {
      throw new AiActionForbiddenException('generation_forbidden', decision.reason ?? 'Forbidden.');
    }
    return decision;
  }

  /** Throw when copilot action is not allowed. */
  requireCopilot(
    action: AiCopilotAction,
    surface: 'admin' | 'customer_support' = 'admin',
  ): AiAuthorizationDecision {
    const decision = this.authorizeCopilot(action, surface);
    if (!decision.allowed) {
      throw new AiActionForbiddenException('copilot_forbidden', decision.reason ?? 'Forbidden.');
    }
    return decision;
  }

  /**
   * Ensure proposal touched fields do not include locked paths
   * (exact match or prefix, e.g. `payments` locks `payments.checkout`).
   */
  assertNoLockedFieldWrites(touchedFields: readonly string[]): void {
    if (this.policy.lockedFields.length === 0 || touchedFields.length === 0) {
      return;
    }

    for (const field of touchedFields) {
      for (const locked of this.policy.lockedFields) {
        if (field === locked || field.startsWith(`${locked}.`) || locked.startsWith(`${field}.`)) {
          throw new AiActionForbiddenException(
            'locked_field',
            `AI cannot modify locked field '${locked}' (touched '${field}').`,
          );
        }
      }
    }
  }

  get snapshot(): ResolvedAiGuardPolicy {
    return this.policy;
  }
}
