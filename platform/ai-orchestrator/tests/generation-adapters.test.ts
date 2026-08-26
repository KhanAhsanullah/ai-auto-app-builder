import { describe, expect, it } from 'vitest';

import { createAiGuardContext } from '../src/domain/create-ai-guard-context.js';
import { createGenerationAdapters } from '../src/domain/generation-adapters.js';
import { buildGenerationPrompt } from '../src/domain/ai-generation-prompts.js';
import { inferTouchedFields } from '../src/domain/infer-touched-fields.js';
import { parseProviderJson } from '../src/domain/parse-provider-json.js';
import { StubAiProvider } from '../src/domain/ai-provider.js';
import {
  AiActionForbiddenException,
  AiProviderResponseException,
  AiValidationException,
} from '../src/errors.js';
import { createTestAiSettings, VALID_BRANDING_PAYLOAD, VALID_THEME_PAYLOAD } from './helpers.js';

describe('parseProviderJson', () => {
  it('accepts objects and JSON strings', () => {
    expect(parseProviderJson({ a: 1 })).toEqual({ a: 1 });
    expect(parseProviderJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('rejects arrays and invalid strings', () => {
    expect(() => parseProviderJson([])).toThrow(AiProviderResponseException);
    expect(() => parseProviderJson('not-json')).toThrow(AiProviderResponseException);
  });
});

describe('inferTouchedFields', () => {
  it('maps config keys and theme/catalog paths', () => {
    expect(inferTouchedFields('config', { branding: {}, featureFlags: {} })).toEqual([
      'branding',
      'featureFlags',
    ]);
    expect(inferTouchedFields('theme', { colors: {}, preset: 'modern' })).toEqual([
      'theme.colors',
      'theme.preset',
    ]);
    expect(
      inferTouchedFields('catalog', {
        productId: 'p1',
        description: 'x',
        categories: ['a'],
      }),
    ).toEqual(['catalog', 'catalog.productId', 'catalog.description', 'catalog.categories']);
  });
});

describe('buildGenerationPrompt', () => {
  it('includes business context for config generation', () => {
    const { prompt, system } = buildGenerationPrompt('config', {
      businessName: 'Fresh Mart',
      vertical: 'grocery',
      description: 'Neighborhood grocery delivery',
      goals: ['fast checkout'],
    });

    expect(system).toMatch(/configuration\/content only/i);
    expect(prompt).toContain('Fresh Mart');
    expect(prompt).toContain('grocery');
  });
});

describe('generation adapters', () => {
  it('creates a theme proposal from provider JSON', async () => {
    const settings = createTestAiSettings();
    const ctx = createAiGuardContext(settings);
    const adapters = createGenerationAdapters({
      provider: new StubAiProvider(VALID_THEME_PAYLOAD),
      proposals: ctx.proposals,
      policy: ctx.policy,
      id: 'theme-1',
      now: () => 42,
    });

    const proposal = await adapters.theme.generate({
      brandName: 'Fresh Mart',
      styleKeywords: ['fresh', 'green'],
      primaryColorHint: '#16A34A',
    });

    expect(proposal).toMatchObject({
      id: 'theme-1',
      target: 'theme',
      status: 'pending_approval',
      createdAt: 42,
      validation: { success: true },
    });
    expect(proposal.touchedFields).toContain('theme.colors');
  });

  it('creates a config proposal from a branding patch', async () => {
    const ctx = createAiGuardContext(createTestAiSettings());
    const adapters = createGenerationAdapters({
      provider: new StubAiProvider({ branding: VALID_BRANDING_PAYLOAD }),
      proposals: ctx.proposals,
      policy: ctx.policy,
    });

    const proposal = await adapters.config.generate({
      businessName: 'Fresh Mart',
      vertical: 'grocery',
      description: 'Local grocery',
    });

    expect(proposal.target).toBe('config');
    expect(proposal.touchedFields).toEqual(['branding']);
  });

  it('creates a catalog enrichment proposal', async () => {
    const ctx = createAiGuardContext(createTestAiSettings());
    const adapters = createGenerationAdapters({
      provider: new StubAiProvider({
        productId: 'sku-apple',
        description: 'Crisp organic apples',
        categories: ['produce'],
      }),
      proposals: ctx.proposals,
      policy: ctx.policy,
    });

    const proposal = await adapters.catalog.generate({
      productId: 'sku-apple',
      productName: 'Organic Apple',
      vertical: 'grocery',
    });

    expect(proposal.target).toBe('catalog');
    expect(proposal.payload).toMatchObject({ productId: 'sku-apple' });
  });

  it('rejects invalid theme JSON from the provider', async () => {
    const ctx = createAiGuardContext(createTestAiSettings());
    const adapters = createGenerationAdapters({
      provider: new StubAiProvider({ preset: 'nope' }),
      proposals: ctx.proposals,
      policy: ctx.policy,
    });

    await expect(
      adapters.theme.generate({ brandName: 'X', styleKeywords: ['modern'] }),
    ).rejects.toThrow(AiValidationException);
  });

  it('rejects generation when the target is not allowed', async () => {
    const ctx = createAiGuardContext(
      createTestAiSettings({
        generation: { allowedTargets: ['config'] },
      }),
    );
    const adapters = createGenerationAdapters({
      provider: new StubAiProvider(VALID_THEME_PAYLOAD),
      proposals: ctx.proposals,
      policy: ctx.policy,
    });

    await expect(
      adapters.theme.generate({ brandName: 'X', styleKeywords: ['modern'] }),
    ).rejects.toThrow(AiActionForbiddenException);
  });
});
