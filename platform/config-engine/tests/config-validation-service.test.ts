import { ConfigProvider, ConfigValidationException } from '@ai-commerce/config-runtime';
import { describe, expect, it } from 'vitest';

import { ConfigValidationService } from '../src/domain/config-validation-service.js';
import { ConfigDraftValidationException } from '../src/errors.js';
import { loadFullTenantConfigLayer } from './helpers.js';

describe('ConfigValidationService', () => {
  const validation = new ConfigValidationService({
    configProvider: new ConfigProvider({ cache: false }),
  });

  it('accepts a full tenant config layer', () => {
    const result = validation.validate(loadFullTenantConfigLayer());
    expect(result.validation.success).toBe(true);
    expect(result.config?.tenant.slug).toBeTruthy();
  });

  it('rejects empty or missing tenant section', () => {
    expect(() => validation.validate(null as never)).toThrow(ConfigDraftValidationException);
    expect(() => validation.validate({})).toThrow(ConfigDraftValidationException);
  });

  it('propagates ConfigProvider schema failures', () => {
    expect(() =>
      validation.validate({
        tenant: { id: 'x', slug: 'x', name: 'X', vertical: 'grocery' },
      }),
    ).toThrow(ConfigValidationException);
  });
});
