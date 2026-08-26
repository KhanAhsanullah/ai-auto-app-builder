import type {
  ResolvedWebNavItem,
  ResolvedWebNavigation,
  WebNavItem,
  WebNavStyle,
} from '../types.js';
import type { FeatureFlagEvaluator } from './feature-flag-evaluator.js';

export interface ResolveWebNavigationInput {
  primary: readonly WebNavItem[];
  secondary?: readonly WebNavItem[];
  footer?: readonly WebNavItem[];
  style?: WebNavStyle;
}

/**
 * Resolves web navigation: drops hidden items and feature-flag-gated entries.
 */
export class WebNavigationResolver {
  constructor(private readonly flags: FeatureFlagEvaluator) {}

  resolve(input: ResolveWebNavigationInput): ResolvedWebNavigation {
    return {
      style: input.style ?? 'top-bar',
      primary: this.filterItems(input.primary),
      secondary: this.filterItems(input.secondary ?? []),
      footer: this.filterItems(input.footer ?? []),
    };
  }

  private filterItems(items: readonly WebNavItem[]): ResolvedWebNavItem[] {
    const resolved: ResolvedWebNavItem[] = [];

    for (const item of items) {
      if (item.visible === false) {
        continue;
      }
      if (item.featureFlag && !this.flags.isEnabled(item.featureFlag)) {
        continue;
      }

      const children = item.children ? this.filterItems(item.children) : undefined;
      resolved.push({
        id: item.id,
        label: item.label,
        route: item.route,
        ...(item.icon ? { icon: item.icon } : {}),
        ...(children && children.length > 0 ? { children } : {}),
      });
    }

    return resolved;
  }
}
