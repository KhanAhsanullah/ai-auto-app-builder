import type { AiGenerationTarget } from '../types.js';

/**
 * Infer dot-path fields touched by a generation payload for locked-field checks.
 */
export function inferTouchedFields(
  target: AiGenerationTarget,
  payload: Record<string, unknown>,
): readonly string[] {
  switch (target) {
    case 'config':
      return Object.keys(payload);
    case 'theme':
      return Object.keys(payload).map((key) => `theme.${key}`);
    case 'navigation':
      return Object.keys(payload).map((key) => `navigation.${key}`);
    case 'copy':
      return Object.keys(payload).map((key) => `branding.${key}`);
    case 'catalog':
    case 'menu_import': {
      const fields = ['catalog'];
      if ('productId' in payload) {
        fields.push('catalog.productId');
      }
      if ('description' in payload) {
        fields.push('catalog.description');
      }
      if ('categories' in payload) {
        fields.push('catalog.categories');
      }
      return fields;
    }
    default: {
      const exhaustive: never = target;
      return [String(exhaustive)];
    }
  }
}
