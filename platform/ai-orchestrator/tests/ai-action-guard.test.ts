import { describe, expect, it } from 'vitest';

import { AiActionGuard } from '../src/domain/ai-action-guard.js';
import { AiGuardPolicyResolver } from '../src/domain/ai-guard-policy-resolver.js';
import { AiActionForbiddenException } from '../src/errors.js';
import { createTestAiSettings } from './helpers.js';

function guardFrom(overrides?: Parameters<typeof createTestAiSettings>[0]): AiActionGuard {
  const policy = new AiGuardPolicyResolver().resolve(createTestAiSettings(overrides));
  return new AiActionGuard(policy);
}

describe('AiActionGuard', () => {
  it('allows generation for permitted targets and requires approval when autoApply is false', () => {
    const guard = guardFrom();
    const decision = guard.authorizeGeneration('theme');

    expect(decision).toEqual({
      allowed: true,
      requiresApproval: true,
    });
  });

  it('rejects generation when AI is disabled', () => {
    const guard = guardFrom({ enabled: false });
    const decision = guard.authorizeGeneration('theme');

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/disabled/i);
  });

  it('rejects generation targets not in allowedTargets', () => {
    const guard = guardFrom({
      generation: {
        allowedTargets: ['theme'],
        autoApply: false,
      },
    });

    expect(guard.authorizeGeneration('catalog').allowed).toBe(false);
  });

  it('skips approval when autoApply is true', () => {
    const guard = guardFrom({
      generation: {
        allowedTargets: ['theme'],
        autoApply: true,
      },
    });

    expect(guard.authorizeGeneration('theme')).toEqual({
      allowed: true,
      requiresApproval: false,
    });
  });

  it('authorizes allowed admin copilot actions', () => {
    const guard = guardFrom();
    expect(guard.authorizeCopilot('read_orders').allowed).toBe(true);
  });

  it('rejects disabled admin copilot', () => {
    const guard = guardFrom({
      copilot: { adminEnabled: false, allowedActions: ['read_orders'] },
    });

    expect(guard.authorizeCopilot('read_orders').allowed).toBe(false);
  });

  it('rejects customer support when that surface is disabled', () => {
    const guard = guardFrom();
    const decision = guard.authorizeCopilot('answer_faq', 'customer_support');

    expect(decision.allowed).toBe(false);
  });

  it('requireGeneration throws AiActionForbiddenException', () => {
    const guard = guardFrom({ enabled: false });
    expect(() => guard.requireGeneration('theme')).toThrow(AiActionForbiddenException);
  });

  it('blocks locked field writes by exact path and prefix', () => {
    const guard = guardFrom();

    expect(() => guard.assertNoLockedFieldWrites(['payments.checkout.captureStrategy'])).toThrow(
      AiActionForbiddenException,
    );

    expect(() =>
      guard.assertNoLockedFieldWrites(['payments.checkout.captureStrategy.extra']),
    ).toThrow(AiActionForbiddenException);

    expect(() => guard.assertNoLockedFieldWrites(['payments'])).toThrow(AiActionForbiddenException);

    expect(() => guard.assertNoLockedFieldWrites(['branding.appName'])).not.toThrow();
  });
});
