import type { AiSettings } from '@ai-commerce/config-schema';

import type { ResolvedAiGuardPolicy } from '../types.js';

/**
 * Maps tenant `aiSettings` into a resolved guard policy for orchestration.
 */
export class AiGuardPolicyResolver {
  resolve(settings: AiSettings): ResolvedAiGuardPolicy {
    return {
      enabled: settings.enabled,
      providerName: settings.provider.name,
      model: settings.provider.model,
      allowedTargets: [...settings.generation.allowedTargets],
      autoApply: settings.generation.autoApply ?? false,
      maxTokensPerRequest: settings.generation.maxTokensPerRequest ?? 4096,
      lockedFields: [...settings.guardrails.lockedFields],
      requireSchemaValidation: settings.guardrails.requireSchemaValidation,
      blockDirectDbWrites: settings.guardrails.blockDirectDbWrites ?? true,
      auditAllSuggestions: settings.guardrails.auditAllSuggestions ?? true,
      copilot: {
        adminEnabled: settings.copilot?.adminEnabled ?? true,
        customerSupportEnabled: settings.copilot?.customerSupportEnabled ?? false,
        allowedActions: [...(settings.copilot?.allowedActions ?? [])],
      },
    };
  }
}
