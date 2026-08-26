import type {
  ConfigLayer,
  ConfigProvider,
  ConfigProviderResult,
} from '@ai-commerce/config-runtime';

import { ConfigDraftValidationException } from '../errors.js';

export interface ConfigValidationServiceDeps {
  configProvider: ConfigProvider;
}

/**
 * Validates a tenant config layer through Config Runtime (schema + resolve).
 */
export class ConfigValidationService {
  constructor(private readonly deps: ConfigValidationServiceDeps) {}

  /**
   * Resolve and validate a config layer.
   * Propagates ConfigValidationException from ConfigProvider on schema failure.
   */
  validate(document: ConfigLayer): ConfigProviderResult {
    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      throw new ConfigDraftValidationException('Config document must be a non-null object.');
    }

    if (!document.tenant || typeof document.tenant !== 'object') {
      throw new ConfigDraftValidationException('Config document must include a tenant section.');
    }

    return this.deps.configProvider.resolve({
      tenantConfig: document,
      skipCache: true,
    });
  }
}
