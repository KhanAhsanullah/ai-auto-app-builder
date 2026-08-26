import type { AiGenerationTarget } from '../types.js';

export interface ConfigGenerationBrief {
  businessName: string;
  vertical: string;
  description: string;
  goals?: readonly string[];
}

export interface ThemeGenerationBrief {
  brandName: string;
  styleKeywords: readonly string[];
  primaryColorHint?: string;
  darkModePreferred?: boolean;
}

export interface CatalogEnrichmentBrief {
  productId: string;
  productName: string;
  existingDescription?: string;
  vertical?: string;
  attributes?: Readonly<Record<string, string>>;
}

export interface GenerationPrompt {
  system: string;
  prompt: string;
}

const SYSTEM_BASE =
  'You are the CommerceOS AI control-plane generator. ' +
  'Return ONLY valid JSON matching the requested schema. ' +
  'Never invent platform architecture, packages, or deployment topology. ' +
  'Generate tenant configuration/content only.';

/** Build prompts for config / theme / catalog generation targets. */
export function buildGenerationPrompt(
  target: 'config' | 'theme' | 'catalog',
  brief: ConfigGenerationBrief | ThemeGenerationBrief | CatalogEnrichmentBrief,
): GenerationPrompt {
  switch (target) {
    case 'config':
      return buildConfigPrompt(brief as ConfigGenerationBrief);
    case 'theme':
      return buildThemePrompt(brief as ThemeGenerationBrief);
    case 'catalog':
      return buildCatalogPrompt(brief as CatalogEnrichmentBrief);
    default: {
      const exhaustive: never = target;
      throw new Error(`Unsupported generation target: ${String(exhaustive)}`);
    }
  }
}

function buildConfigPrompt(brief: ConfigGenerationBrief): GenerationPrompt {
  const goals =
    brief.goals && brief.goals.length > 0 ? brief.goals.join(', ') : 'launch a branded storefront';

  return {
    system: SYSTEM_BASE,
    prompt: [
      `Generate a partial tenant configuration JSON patch for business "${brief.businessName}".`,
      `Vertical: ${brief.vertical}.`,
      `Description: ${brief.description}`,
      `Goals: ${goals}.`,
      'Include only config keys that should change (e.g. branding, featureFlags).',
      'Do not include meta, tenant identity, or payment capture strategy.',
    ].join(' '),
  };
}

function buildThemePrompt(brief: ThemeGenerationBrief): GenerationPrompt {
  return {
    system: SYSTEM_BASE,
    prompt: [
      `Generate a complete Theme JSON document for brand "${brief.brandName}".`,
      `Style keywords: ${brief.styleKeywords.join(', ') || 'modern, clean'}.`,
      brief.primaryColorHint ? `Prefer primary color near ${brief.primaryColorHint}.` : '',
      brief.darkModePreferred === true ? 'Enable dark mode with strategy "system".' : '',
      'Output must satisfy the Theme schema (preset, colors, typography, spacing, radius, elevation, darkMode).',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

function buildCatalogPrompt(brief: CatalogEnrichmentBrief): GenerationPrompt {
  const attrs = brief.attributes
    ? Object.entries(brief.attributes)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')
    : '';

  return {
    system: SYSTEM_BASE,
    prompt: [
      `Enrich catalog product "${brief.productName}" (productId: ${brief.productId}).`,
      brief.vertical ? `Vertical: ${brief.vertical}.` : '',
      brief.existingDescription ? `Existing description: ${brief.existingDescription}` : '',
      attrs ? `Known attributes: ${attrs}.` : '',
      'Return JSON with productId, description (string), and optional categories (string array).',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

/** Targets that have dedicated Task 2 adapters. */
export type AdapterGenerationTarget = Extract<AiGenerationTarget, 'config' | 'theme' | 'catalog'>;
