import { environmentSettingsSchema } from '@ai-commerce/config-schema';
import { describe, expect, it } from 'vitest';

import { EnvironmentBuilder } from '../src/domain/environment-builder.js';

describe('EnvironmentBuilder', () => {
  const builder = new EnvironmentBuilder();

  it('builds environment settings that validate against the schema', () => {
    const environment = builder.build({ slug: 'acme-market' });

    expect(() => environmentSettingsSchema.parse(environment)).not.toThrow();
  });

  it('includes development, staging, and production targets', () => {
    const environment = builder.build({ slug: 'acme-market' });

    expect(environment.targets.development).toBeDefined();
    expect(environment.targets.staging).toBeDefined();
    expect(environment.targets.production).toBeDefined();
  });

  it('embeds tenant slug in staging and production API URLs', () => {
    const slug = 'fresh-grocery';
    const environment = builder.build({ slug });

    expect(environment.targets.development.apiBaseUrl).toBe('http://localhost:3000');
    expect(environment.targets.staging.apiBaseUrl).toBe(
      'https://api-staging.fresh-grocery.platform.local',
    );
    expect(environment.targets.production.apiBaseUrl).toBe(
      'https://api.fresh-grocery.platform.local',
    );
  });

  it('sets current environment to development', () => {
    const environment = builder.build({ slug: 'acme-market' });

    expect(environment.current).toBe('development');
  });

  it('omits environment overrides', () => {
    const environment = builder.build({ slug: 'acme-market' });

    expect(environment.overrides).toBeUndefined();
  });

  it('does not include timestamps in environment settings', () => {
    const environment = builder.build({ slug: 'acme-market' });
    const serialized = JSON.stringify(environment);

    expect(serialized).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('applies promotion policy defaults matching schema examples', () => {
    const environment = builder.build({ slug: 'acme-market' });

    expect(environment.promotionPolicy).toEqual({
      requireApproval: true,
      runValidationOnPromote: true,
    });
  });

  it('sets debug and logLevel per environment target', () => {
    const environment = builder.build({ slug: 'acme-market' });

    expect(environment.targets.development.debug).toBe(true);
    expect(environment.targets.development.logLevel).toBe('debug');
    expect(environment.targets.staging.debug).toBe(false);
    expect(environment.targets.staging.logLevel).toBe('info');
    expect(environment.targets.production.debug).toBe(false);
    expect(environment.targets.production.logLevel).toBe('warn');
  });
});
