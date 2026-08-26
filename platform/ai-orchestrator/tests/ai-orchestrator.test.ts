import { describe, expect, it } from 'vitest';

import { createAiOrchestrator } from '../src/domain/create-ai-orchestrator.js';
import { StubAiProvider } from '../src/domain/ai-provider.js';
import { AiActionForbiddenException, AiValidationException } from '../src/errors.js';
import { createTestAiSettings, VALID_BRANDING_PAYLOAD, VALID_THEME_PAYLOAD } from './helpers.js';

describe('AiOrchestrator / createAiOrchestrator', () => {
  it('wires policy from settings and exposes provider id', () => {
    const orchestrator = createAiOrchestrator({
      settings: createTestAiSettings(),
      provider: new StubAiProvider(VALID_THEME_PAYLOAD),
    });

    expect(orchestrator.getProviderId()).toBe('stub');
    expect(orchestrator.getPolicy().enabled).toBe(true);
    expect(orchestrator.getPolicy().allowedTargets).toContain('theme');
  });

  it('accepts ConfigProvider-shaped settings via toAiSettings', () => {
    const settings = createTestAiSettings({ enabled: true });
    const orchestrator = createAiOrchestrator({
      settings: { config: { aiSettings: settings } },
      provider: new StubAiProvider(),
    });

    expect(orchestrator.getPolicy().providerName).toBe('openai');
  });

  it('generateTheme returns a guarded proposal', async () => {
    const orchestrator = createAiOrchestrator({
      settings: createTestAiSettings(),
      provider: new StubAiProvider(VALID_THEME_PAYLOAD),
      proposalId: 'facade-theme',
      now: () => 99,
    });

    const proposal = await orchestrator.generateTheme({
      brandName: 'Fresh Mart',
      styleKeywords: ['fresh'],
    });

    expect(proposal).toMatchObject({
      id: 'facade-theme',
      target: 'theme',
      status: 'pending_approval',
      createdAt: 99,
      requiresApproval: true,
    });
  });

  it('generateConfig and enrichCatalog delegate to adapters', async () => {
    const configOrchestrator = createAiOrchestrator({
      settings: createTestAiSettings(),
      provider: new StubAiProvider({ branding: VALID_BRANDING_PAYLOAD }),
    });
    const configProposal = await configOrchestrator.generateConfig({
      businessName: 'Fresh Mart',
      vertical: 'grocery',
      description: 'Local grocery',
    });
    expect(configProposal.target).toBe('config');

    const catalogOrchestrator = createAiOrchestrator({
      settings: createTestAiSettings(),
      provider: new StubAiProvider({
        productId: 'sku-1',
        description: 'Nice apples',
        categories: ['produce'],
      }),
    });
    const catalogProposal = await catalogOrchestrator.enrichCatalog({
      productId: 'sku-1',
      productName: 'Apples',
    });
    expect(catalogProposal.target).toBe('catalog');
  });

  it('authorizeCopilot and requireCopilot enforce tenant policy', () => {
    const orchestrator = createAiOrchestrator({
      settings: createTestAiSettings(),
      provider: new StubAiProvider(),
    });

    expect(orchestrator.authorizeCopilot('read_orders').allowed).toBe(true);
    expect(() => orchestrator.requireCopilot('answer_faq')).toThrow(AiActionForbiddenException);
  });

  it('createProposal validates caller-supplied payloads', () => {
    const orchestrator = createAiOrchestrator({
      settings: createTestAiSettings(),
      provider: new StubAiProvider(),
    });

    const ok = orchestrator.createProposal({
      target: 'theme',
      payload: VALID_THEME_PAYLOAD,
    });
    expect(ok.validation.success).toBe(true);

    expect(() =>
      orchestrator.createProposal({
        target: 'theme',
        payload: { preset: 'broken' },
      }),
    ).toThrow(AiValidationException);
  });

  it('rejects generation when AI is disabled', async () => {
    const orchestrator = createAiOrchestrator({
      settings: createTestAiSettings({ enabled: false }),
      provider: new StubAiProvider(VALID_THEME_PAYLOAD),
    });

    await expect(
      orchestrator.generateTheme({ brandName: 'X', styleKeywords: ['modern'] }),
    ).rejects.toThrow(AiActionForbiddenException);
  });
});
