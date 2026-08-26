import type { AiSettings } from '@ai-commerce/config-schema';

import { AiActionGuard } from './ai-action-guard.js';
import { AiGuardPolicyResolver } from './ai-guard-policy-resolver.js';
import { AiOutputValidator } from './ai-output-validator.js';
import { AiProposalFactory } from './ai-proposal-factory.js';
import type { ResolvedAiGuardPolicy } from '../types.js';

export interface AiGuardContext {
  policy: ResolvedAiGuardPolicy;
  guard: AiActionGuard;
  validator: AiOutputValidator;
  proposals: AiProposalFactory;
}

/** Wire guard policy, action guard, validator, and proposal factory from AiSettings. */
export function createAiGuardContext(settings: AiSettings): AiGuardContext {
  const policy = new AiGuardPolicyResolver().resolve(settings);
  const guard = new AiActionGuard(policy);
  const validator = new AiOutputValidator();
  const proposals = new AiProposalFactory(guard, validator, policy);

  return { policy, guard, validator, proposals };
}
