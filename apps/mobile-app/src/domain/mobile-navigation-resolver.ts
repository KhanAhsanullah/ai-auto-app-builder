import type {
  MobileNavItem,
  MobileNavStyle,
  ResolvedMobileNavItem,
  ResolvedMobileNavigation,
} from '../types.js';
import type { FeatureFlagEvaluator } from './feature-flag-evaluator.js';

export interface ResolveMobileNavigationInput {
  primary: readonly MobileNavItem[];
  secondary?: readonly MobileNavItem[];
  footer?: readonly MobileNavItem[];
  style?: MobileNavStyle;
}

/**
 * Resolves mobile navigation: drops hidden items and feature-flag-gated entries.
 */
export class MobileNavigationResolver {
  constructor(private readonly flags: FeatureFlagEvaluator) {}

  resolve(input: ResolveMobileNavigationInput): ResolvedMobileNavigation {
    return {
      style: input.style ?? 'bottom-bar',
      primary: this.filterItems(input.primary),
      secondary: this.filterItems(input.secondary ?? []),
      footer: this.filterItems(input.footer ?? []),
    };
  }

  private filterItems(items: readonly MobileNavItem[]): ResolvedMobileNavItem[] {
    const resolved: ResolvedMobileNavItem[] = [];

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
