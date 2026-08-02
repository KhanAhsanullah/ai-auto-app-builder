import type { TenantConfiguration } from '@ai-commerce/config-schema';

import { PLATFORM_DEFAULTS } from './defaults/platform-defaults.js';
import { getVerticalDefaults } from './defaults/vertical-defaults.js';
import { deepFreeze, deepMerge, shallowMergeSections } from './deep-merge.js';
import { ConfigResolutionException } from './errors.js';
import type { ConfigLayer, ResolveConfigInput, ResolvedConfig } from './types.js';

/** Resolves configuration by merging the inheritance chain in priority order. */
export class ConfigResolver {
  /**
   * Merge configuration layers:
   * platform defaults → vertical defaults → tenant config → environment overrides.
   */
  resolve(input: ResolveConfigInput): ResolvedConfig {
    const platformLayer = input.platformDefaults ?? PLATFORM_DEFAULTS;
    const tenantLayer = input.tenantConfig;

    const vertical = tenantLayer.tenant?.vertical;
    if (!vertical) {
      throw new ConfigResolutionException(
        'Tenant configuration must include tenant.vertical for vertical preset resolution.',
      );
    }

    const verticalLayer = input.verticalDefaults ?? getVerticalDefaults(vertical);

    const environment =
      input.environment ??
      tenantLayer.environment?.current ??
      platformLayer.environment?.current ??
      'development';

    let merged: ConfigLayer = deepMerge({}, platformLayer);
    merged = deepMerge(merged, verticalLayer);
    merged = deepMerge(merged, tenantLayer);

    const environmentLayer = (tenantLayer.environment?.overrides?.[environment] ??
      {}) as ConfigLayer;

    if (Object.keys(environmentLayer).length > 0) {
      merged = shallowMergeSections(merged, environmentLayer);
    }

    merged = deepMerge(merged, {
      environment: {
        ...(merged.environment ?? {}),
        current: environment,
      },
    });

    const config = deepFreeze(merged) as Readonly<TenantConfiguration>;

    return {
      config,
      layers: {
        platform: platformLayer,
        vertical: verticalLayer,
        tenant: tenantLayer,
        environment: environmentLayer,
      },
      environment,
      vertical,
    };
  }
}
