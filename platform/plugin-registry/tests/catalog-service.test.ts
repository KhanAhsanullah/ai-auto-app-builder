import { describe, expect, it } from 'vitest';

import { CatalogService } from '../src/domain/catalog-service.js';
import { ManifestValidator } from '../src/domain/manifest-validator.js';
import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import {
  PluginAlreadyRegisteredException,
  PluginManifestValidationException,
} from '../src/errors.js';
import {
  INVALID_PLUGIN_MANIFEST_UNKNOWN_HOOK,
  VALID_PLUGIN_MANIFEST,
  VALID_PLUGIN_MANIFEST_V2,
} from './helpers.js';

const FIXED_CLOCK = '2026-08-16T00:00:00.000Z';

function createService() {
  const repository = new InMemoryPluginCatalogRepository();

  return {
    repository,
    service: new CatalogService({
      validator: new ManifestValidator(),
      repository,
      clock: () => FIXED_CLOCK,
    }),
  };
}

describe('CatalogService', () => {
  it('registers a valid manifest successfully', async () => {
    const { service } = createService();

    const result = await service.register(VALID_PLUGIN_MANIFEST);

    expect(result.created).toBe(true);
    expect(result.pluginId).toBe(VALID_PLUGIN_MANIFEST.id);
    expect(result.version).toBe('1.0.0');
    expect(result.registeredAt).toBe(FIXED_CLOCK);
    expect(result.manifestFingerprint).toHaveLength(64);
  });

  it('returns idempotent success for identical manifest replay', async () => {
    const { service } = createService();

    const first = await service.register(VALID_PLUGIN_MANIFEST);
    const second = await service.register(VALID_PLUGIN_MANIFEST);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.manifestFingerprint).toBe(first.manifestFingerprint);
    expect(second.registeredAt).toBe(first.registeredAt);
  });

  it('throws when the same id and version are registered with different content', async () => {
    const { service } = createService();

    await service.register(VALID_PLUGIN_MANIFEST);

    const changedManifest = {
      ...VALID_PLUGIN_MANIFEST,
      description: 'Changed description.',
    };

    await expect(service.register(changedManifest)).rejects.toThrow(
      PluginAlreadyRegisteredException,
    );
  });

  it('allows a new version for the same plugin id', async () => {
    const { service } = createService();

    const first = await service.register(VALID_PLUGIN_MANIFEST);
    const second = await service.register(VALID_PLUGIN_MANIFEST_V2);

    expect(first.created).toBe(true);
    expect(second.created).toBe(true);
    expect(second.version).toBe('2.0.0');
  });

  it('does not persist when validation fails', async () => {
    const { repository, service } = createService();

    await expect(service.register(INVALID_PLUGIN_MANIFEST_UNKNOWN_HOOK)).rejects.toThrow(
      PluginManifestValidationException,
    );

    await expect(repository.list()).resolves.toEqual([]);
  });
});
