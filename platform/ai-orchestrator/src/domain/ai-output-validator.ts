import { brandingSchema, navigationSchema, themeSchema } from '@ai-commerce/config-schema';

import type { AiGenerationTarget } from '../types.js';

export interface AiValidationResult {
  success: boolean;
  errors: readonly string[];
}

/**
 * Schema-bound validation for AI proposal payloads.
 * Uses generated Zod schemas from `@ai-commerce/config-schema`.
 */
export class AiOutputValidator {
  validate(target: AiGenerationTarget, payload: unknown): AiValidationResult {
    switch (target) {
      case 'theme':
        return this.fromZod(themeSchema.safeParse(payload));
      case 'navigation':
        return this.fromZod(navigationSchema.safeParse(payload));
      case 'copy':
        return this.fromZod(brandingSchema.safeParse(payload));
      case 'config':
        return this.validateConfigPatch(payload);
      case 'catalog':
      case 'menu_import':
        return this.validateCatalogEnrichment(payload);
      default: {
        const exhaustive: never = target;
        return { success: false, errors: [`Unknown generation target: ${String(exhaustive)}`] };
      }
    }
  }

  private validateConfigPatch(payload: unknown): AiValidationResult {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { success: false, errors: ['Config proposal payload must be a non-null object.'] };
    }

    // Partial tenant config patches: reject empty objects and non-plain values at root keys.
    const entries = Object.entries(payload as Record<string, unknown>);
    if (entries.length === 0) {
      return { success: false, errors: ['Config proposal payload must not be empty.'] };
    }

    const errors: string[] = [];
    for (const [key, value] of entries) {
      if (value === undefined) {
        errors.push(`Config patch key '${key}' must not be undefined.`);
      }
    }

    return { success: errors.length === 0, errors };
  }

  private validateCatalogEnrichment(payload: unknown): AiValidationResult {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { success: false, errors: ['Catalog enrichment payload must be a non-null object.'] };
    }

    const record = payload as Record<string, unknown>;
    if (typeof record['productId'] !== 'string' || record['productId'].length === 0) {
      return { success: false, errors: ["Catalog enrichment requires a non-empty 'productId'."] };
    }

    if (record['description'] !== undefined && typeof record['description'] !== 'string') {
      return { success: false, errors: ["Catalog enrichment 'description' must be a string."] };
    }

    if (record['categories'] !== undefined && !Array.isArray(record['categories'])) {
      return { success: false, errors: ["Catalog enrichment 'categories' must be an array."] };
    }

    return { success: true, errors: [] };
  }

  private fromZod(result: {
    success: boolean;
    error?: { issues: readonly { path: (string | number)[]; message: string }[] };
  }): AiValidationResult {
    if (result.success) {
      return { success: true, errors: [] };
    }

    const errors = (result.error?.issues ?? []).map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    });

    return { success: false, errors };
  }
}
