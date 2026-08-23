import type {
  AdminNavItem,
  AdminNavStyle,
  ResolvedAdminNavItem,
  ResolvedAdminNavigation,
} from '../types.js';
import type { FeatureFlagEvaluator } from './feature-flag-evaluator.js';

export interface ResolveAdminNavigationInput {
  primary: readonly AdminNavItem[];
  secondary?: readonly AdminNavItem[];
  footer?: readonly AdminNavItem[];
  style?: AdminNavStyle;
}

/**
 * Resolves admin navigation: drops hidden items and feature-flag-gated entries.
 */
export class AdminNavigationResolver {
  constructor(private readonly flags: FeatureFlagEvaluator) {}

  resolve(input: ResolveAdminNavigationInput): ResolvedAdminNavigation {
    return {
      style: input.style ?? 'sidebar',
      primary: this.filterItems(input.primary),
      secondary: this.filterItems(input.secondary ?? []),
      footer: this.filterItems(input.footer ?? []),
    };
  }

  private filterItems(items: readonly AdminNavItem[]): ResolvedAdminNavItem[] {
    const resolved: ResolvedAdminNavItem[] = [];

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
