import { tenantConfigurationSchema } from '@ai-commerce/config-schema';
import type { TenantConfiguration } from '@ai-commerce/config-schema';

import { ConfigValidationException, formatZodErrors } from './errors.js';
import type { ValidationResult } from './types.js';

/** Validates resolved configuration against the canonical Zod schema. */
export class ConfigValidator {
  /** Validate configuration and return a structured result. */
  validate(config: unknown): ValidationResult {
    const result = tenantConfigurationSchema.safeParse(config);

    if (result.success) {
      return {
        success: true,
        config: result.data as TenantConfiguration,
        errors: [],
      };
    }

    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }

  /** Validate configuration and throw a human-readable exception on failure. */
  validateOrThrow(config: unknown): TenantConfiguration {
    const result = this.validate(config);

    if (!result.success) {
      throw new ConfigValidationException(result.errors);
    }

    return result.config!;
  }
}
