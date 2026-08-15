import { describe, expect, it } from 'vitest';

import { DependencyResolver } from '../src/domain/dependency-resolver.js';
import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import {
  PluginCatalogNotFoundException,
  PluginDependencyCycleException,
  PluginDependencyUnresolvedException,
} from '../src/errors.js';
import {
  PLUGIN_MANIFEST_WITH_CYCLE_A,
  PLUGIN_MANIFEST_WITH_CYCLE_B,
  PLUGIN_MANIFEST_WITH_DEPENDENCY,
  VALID_PLUGIN_MANIFEST,
  seedCatalog,
} from './helpers.js';

describe('DependencyResolver', () => {
  it('returns an empty dependency list when manifest has no dependencies', async () => {
    const repository = new InMemoryPluginCatalogRepository();
    await seedCatalog(repository);

    const resolver = new DependencyResolver(repository);
    const result = await resolver.resolve(VALID_PLUGIN_MANIFEST.id, VALID_PLUGIN_MANIFEST.version);

    expect(result.resolved).toEqual([]);
  });

  it('resolves a direct dependency to the highest compatible catalog version', async () => {
    const repository = new InMemoryPluginCatalogRepository();
    await seedCatalog(repository, [
      VALID_PLUGIN_MANIFEST,
      { ...VALID_PLUGIN_MANIFEST, version: '1.5.0' },
      PLUGIN_MANIFEST_WITH_DEPENDENCY,
    ]);

    const resolver = new DependencyResolver(repository);
    const result = await resolver.resolve(
      PLUGIN_MANIFEST_WITH_DEPENDENCY.id,
      PLUGIN_MANIFEST_WITH_DEPENDENCY.version,
    );

    expect(result.resolved).toEqual([
      {
        pluginId: VALID_PLUGIN_MANIFEST.id,
        requestedRange: '^1.0.0',
        resolvedVersion: '1.5.0',
      },
    ]);
  });

  it('throws when the root plugin is missing from the catalog', async () => {
    const resolver = new DependencyResolver(new InMemoryPluginCatalogRepository());

    await expect(resolver.resolve('missing.plugin', '1.0.0')).rejects.toThrow(
      PluginCatalogNotFoundException,
    );
  });

  it('throws when no catalog version satisfies a dependency range', async () => {
    const repository = new InMemoryPluginCatalogRepository();
    await seedCatalog(repository, [PLUGIN_MANIFEST_WITH_DEPENDENCY]);

    const resolver = new DependencyResolver(repository);

    await expect(
      resolver.resolve(PLUGIN_MANIFEST_WITH_DEPENDENCY.id, PLUGIN_MANIFEST_WITH_DEPENDENCY.version),
    ).rejects.toThrow(PluginDependencyUnresolvedException);
  });

  it('resolves transitive dependencies in deterministic order', async () => {
    const base: typeof VALID_PLUGIN_MANIFEST = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.base.plugin',
      dependencies: [],
    };
    const middle: typeof VALID_PLUGIN_MANIFEST = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.middle.plugin',
      dependencies: [{ id: base.id, versionRange: '^1.0.0' }],
    };
    const top: typeof VALID_PLUGIN_MANIFEST = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.top.plugin',
      dependencies: [{ id: middle.id, versionRange: '^1.0.0' }],
    };

    const repository = new InMemoryPluginCatalogRepository();
    await seedCatalog(repository, [base, middle, top]);

    const resolver = new DependencyResolver(repository);
    const result = await resolver.resolve(top.id, top.version);

    expect(result.resolved.map((entry) => entry.pluginId)).toEqual([base.id, middle.id]);
  });

  it('deduplicates shared transitive dependencies', async () => {
    const shared = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.shared.plugin',
      dependencies: [],
    };
    const left = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.left.plugin',
      dependencies: [{ id: shared.id, versionRange: '^1.0.0' }],
    };
    const right = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.right.plugin',
      dependencies: [{ id: shared.id, versionRange: '^1.0.0' }],
    };
    const root = {
      ...VALID_PLUGIN_MANIFEST,
      id: 'com.commerceos.root.plugin',
      dependencies: [
        { id: left.id, versionRange: '^1.0.0' },
        { id: right.id, versionRange: '^1.0.0' },
      ],
    };

    const repository = new InMemoryPluginCatalogRepository();
    await seedCatalog(repository, [shared, left, right, root]);

    const resolver = new DependencyResolver(repository);
    const result = await resolver.resolve(root.id, root.version);

    expect(result.resolved.filter((entry) => entry.pluginId === shared.id)).toHaveLength(1);
  });

  it('throws when dependency resolution detects a cycle', async () => {
    const repository = new InMemoryPluginCatalogRepository();
    await seedCatalog(repository, [PLUGIN_MANIFEST_WITH_CYCLE_A, PLUGIN_MANIFEST_WITH_CYCLE_B]);

    const resolver = new DependencyResolver(repository);

    await expect(
      resolver.resolve(PLUGIN_MANIFEST_WITH_CYCLE_A.id, PLUGIN_MANIFEST_WITH_CYCLE_A.version),
    ).rejects.toThrow(PluginDependencyCycleException);
  });
});
