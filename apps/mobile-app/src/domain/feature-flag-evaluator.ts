import type { FeatureFlags } from '@ai-commerce/config-schema';

/**
 * Evaluates tenant feature flags for mobile navigation and shell gates.
 * Supports `flags.<key>` and `modules.<module>` keys.
 */
export class FeatureFlagEvaluator {
  constructor(private readonly featureFlags: FeatureFlags) {}

  /** Return whether a feature flag / module key is enabled. */
  isEnabled(key: string): boolean {
    const trimmed = key.trim();
    if (!trimmed) {
      return false;
    }

    if (trimmed.startsWith('modules.')) {
      const moduleName = trimmed.slice('modules.'.length) as keyof FeatureFlags['modules'];
      return this.featureFlags.modules[moduleName] === true;
    }

    if (trimmed in this.featureFlags.flags) {
      return this.featureFlags.flags[trimmed] === true;
    }

    if (trimmed in this.featureFlags.modules) {
      return this.featureFlags.modules[trimmed as keyof FeatureFlags['modules']] === true;
    }

    return false;
  }

  /** Snapshot of the underlying feature flag config. */
  get raw(): FeatureFlags {
    return this.featureFlags;
  }
}
