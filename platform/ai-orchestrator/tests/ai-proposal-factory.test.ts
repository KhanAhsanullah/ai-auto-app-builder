import { describe, expect, it } from 'vitest';

import { createAiGuardContext } from '../src/domain/create-ai-guard-context.js';
import { toAiSettings } from '../src/domain/map-ai-settings.js';
import { StubAiProvider } from '../src/domain/ai-provider.js';
import { AiActionForbiddenException, AiValidationException } from '../src/errors.js';
import { createTestAiSettings, VALID_THEME_PAYLOAD } from './helpers.js';

describe('AiProposalFactory + createAiGuardContext', () => {
  it('creates a pending_approval proposal for valid theme output', () => {
    const { proposals } = createAiGuardContext(createTestAiSettings());

    const proposal = proposals.create({
      target: 'theme',
      payload: VALID_THEME_PAYLOAD,
      touchedFields: ['theme.colors.primary'],
      id: 'proposal-1',
      now: () => 1_700_000_000_000,
    });

    expect(proposal).toMatchObject({
      id: 'proposal-1',
      target: 'theme',
      status: 'pending_approval',
      requiresApproval: true,
      createdAt: 1_700_000_000_000,
      validation: { success: true, errors: [] },
    });
  });

  it('marks proposal approved when autoApply is enabled', () => {
    const { proposals } = createAiGuardContext(
      createTestAiSettings({
        generation: {
          allowedTargets: ['theme'],
          autoApply: true,
        },
      }),
    );

    const proposal = proposals.create({
      target: 'theme',
      payload: VALID_THEME_PAYLOAD,
    });

    expect(proposal.status).toBe('approved');
    expect(proposal.requiresApproval).toBe(false);
  });

  it('rejects invalid schema output', () => {
    const { proposals } = createAiGuardContext(createTestAiSettings());

    expect(() =>
      proposals.create({
        target: 'theme',
        payload: { preset: 'broken' },
      }),
    ).toThrow(AiValidationException);
  });

  it('rejects locked field touches before validation', () => {
    const { proposals } = createAiGuardContext(createTestAiSettings());

    expect(() =>
      proposals.create({
        target: 'config',
        payload: { payments: { checkout: { captureStrategy: 'manual' } } },
        touchedFields: ['payments.checkout.captureStrategy'],
      }),
    ).toThrow(AiActionForbiddenException);
  });

  it('skips schema validation when requireSchemaValidation is false', () => {
    const { proposals } = createAiGuardContext(
      createTestAiSettings({
        guardrails: {
          lockedFields: [],
          requireSchemaValidation: false,
        },
      }),
    );

    const proposal = proposals.create({
      target: 'theme',
      payload: { not: 'a-theme' },
    });

    expect(proposal.validation.success).toBe(true);
  });
});

describe('toAiSettings', () => {
  it('extracts settings from raw AiSettings, tenant config, and ConfigProvider result shapes', () => {
    const settings = createTestAiSettings();

    expect(toAiSettings(settings)).toBe(settings);
    expect(toAiSettings({ aiSettings: settings })).toBe(settings);
    expect(toAiSettings({ config: { aiSettings: settings } })).toBe(settings);
  });
});

describe('StubAiProvider', () => {
  it('returns the configured JSON response', async () => {
    const provider = new StubAiProvider({ theme: VALID_THEME_PAYLOAD });
    await expect(provider.generateJson({ prompt: 'make a theme' })).resolves.toEqual({
      theme: VALID_THEME_PAYLOAD,
    });
    expect(provider.id).toBe('stub');
  });
});
