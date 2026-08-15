import type { EnvironmentSettings } from '@ai-commerce/config-schema';

import {
  buildDevelopmentApiUrl,
  buildProductionApiUrl,
  buildStagingApiUrl,
  ENVIRONMENT_PROMOTION_POLICY,
} from '../templates/environment-config.js';

export interface EnvironmentBuilderInput {
  slug: string;
}

/** Builds tenant-specific environment settings during provisioning. */
export class EnvironmentBuilder {
  /** Construct environment settings with slug-derived deployment targets. */
  build(input: EnvironmentBuilderInput): EnvironmentSettings {
    return {
      current: 'development',
      targets: {
        development: {
          apiBaseUrl: buildDevelopmentApiUrl(),
          debug: true,
          logLevel: 'debug',
        },
        staging: {
          apiBaseUrl: buildStagingApiUrl(input.slug),
          debug: false,
          logLevel: 'info',
        },
        production: {
          apiBaseUrl: buildProductionApiUrl(input.slug),
          debug: false,
          logLevel: 'warn',
        },
      },
      promotionPolicy: {
        ...ENVIRONMENT_PROMOTION_POLICY,
      },
    };
  }
}
