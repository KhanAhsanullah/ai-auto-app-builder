import type { AiProposal } from '../types.js';
import type { AiProposalFactory } from './ai-proposal-factory.js';
import type { AiProvider } from './ai-provider.js';
import {
  buildGenerationPrompt,
  type CatalogEnrichmentBrief,
  type ConfigGenerationBrief,
  type ThemeGenerationBrief,
} from './ai-generation-prompts.js';
import { inferTouchedFields } from './infer-touched-fields.js';
import { parseProviderJson } from './parse-provider-json.js';
import type { ResolvedAiGuardPolicy } from '../types.js';

export interface GenerationAdapterOptions {
  provider: AiProvider;
  proposals: AiProposalFactory;
  policy: ResolvedAiGuardPolicy;
  /** Override id (tests). */
  id?: string;
  now?: () => number;
}

async function runGeneration(
  target: 'config' | 'theme' | 'catalog',
  brief: ConfigGenerationBrief | ThemeGenerationBrief | CatalogEnrichmentBrief,
  options: GenerationAdapterOptions,
): Promise<AiProposal> {
  const { system, prompt } = buildGenerationPrompt(target, brief);
  const raw = await options.provider.generateJson({
    prompt,
    system,
    maxTokens: options.policy.maxTokensPerRequest,
  });
  const payload = parseProviderJson(raw);
  const touchedFields = inferTouchedFields(target, payload);

  return options.proposals.create({
    target,
    payload,
    touchedFields,
    id: options.id,
    now: options.now,
  });
}

/** Produces schema-validated config patch proposals via AiProvider. */
export class ConfigGenerationAdapter {
  constructor(private readonly options: GenerationAdapterOptions) {}

  generate(brief: ConfigGenerationBrief): Promise<AiProposal> {
    return runGeneration('config', brief, this.options);
  }
}

/** Produces schema-validated theme proposals via AiProvider. */
export class ThemeGenerationAdapter {
  constructor(private readonly options: GenerationAdapterOptions) {}

  generate(brief: ThemeGenerationBrief): Promise<AiProposal> {
    return runGeneration('theme', brief, this.options);
  }
}

/** Produces schema-validated catalog enrichment proposals via AiProvider. */
export class CatalogGenerationAdapter {
  constructor(private readonly options: GenerationAdapterOptions) {}

  generate(brief: CatalogEnrichmentBrief): Promise<AiProposal> {
    return runGeneration('catalog', brief, this.options);
  }
}

export interface GenerationAdapters {
  config: ConfigGenerationAdapter;
  theme: ThemeGenerationAdapter;
  catalog: CatalogGenerationAdapter;
}

/** Wire config / theme / catalog adapters against a shared provider + proposal factory. */
export function createGenerationAdapters(options: GenerationAdapterOptions): GenerationAdapters {
  return {
    config: new ConfigGenerationAdapter(options),
    theme: new ThemeGenerationAdapter(options),
    catalog: new CatalogGenerationAdapter(options),
  };
}
