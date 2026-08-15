import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import { CatalogService } from '../src/domain/catalog-service.js';
import { DiscoveryService } from '../src/domain/discovery-service.js';
import { ManifestValidator } from '../src/domain/manifest-validator.js';
import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import type { FilesystemManifestScanner } from '../src/infrastructure/filesystem-manifest-scanner.js';
import type { ScannedManifestFile } from '../src/types.js';
import { VALID_PLUGIN_MANIFEST, VALID_PLUGIN_MANIFEST_V2 } from './helpers.js';

class StubScanner implements FilesystemManifestScanner {
  constructor(private readonly files: ScannedManifestFile[]) {}

  async scan(): Promise<ScannedManifestFile[]> {
    return this.files;
  }
}

describe('DiscoveryService', () => {
  it('registers valid manifests discovered on disk', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-discovery-'));

    try {
      await writeFile(
        join(root, 'contrast.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST, null, 2)}\n`,
        'utf8',
      );

      const repository = new InMemoryPluginCatalogRepository();
      const service = new DiscoveryService({
        catalogService: new CatalogService({
          validator: new ManifestValidator(),
          repository,
        }),
      });

      const result = await service.discoverFromDirectory(root);

      expect(result.discovered).toBe(1);
      expect(result.registered).toBe(1);
      expect(result.entries[0]?.status).toBe('registered');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('skips idempotent catalog replays', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-discovery-'));

    try {
      await writeFile(
        join(root, 'contrast.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST, null, 2)}\n`,
        'utf8',
      );

      const repository = new InMemoryPluginCatalogRepository();
      const catalogService = new CatalogService({
        validator: new ManifestValidator(),
        repository,
      });

      await catalogService.register(VALID_PLUGIN_MANIFEST);

      const result = await new DiscoveryService({ catalogService }).discoverFromDirectory(root);

      expect(result.skipped).toBe(1);
      expect(result.registered).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('records failed entries for invalid manifests and continues scanning', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-discovery-'));

    try {
      await writeFile(
        join(root, 'bad.plugin-manifest.json'),
        `${JSON.stringify({ id: 'InvalidPluginId' }, null, 2)}\n`,
        'utf8',
      );
      await writeFile(
        join(root, 'good.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST_V2, null, 2)}\n`,
        'utf8',
      );

      const repository = new InMemoryPluginCatalogRepository();
      const result = await new DiscoveryService({
        catalogService: new CatalogService({
          validator: new ManifestValidator(),
          repository,
        }),
      }).discoverFromDirectory(root);

      expect(result.failed).toBe(1);
      expect(result.registered).toBe(1);
      expect(result.entries[0]?.status).toBe('failed');
      expect(result.entries[1]?.status).toBe('registered');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('returns zero counts for an empty directory scan', async () => {
    const service = new DiscoveryService({
      catalogService: new CatalogService({
        validator: new ManifestValidator(),
        repository: new InMemoryPluginCatalogRepository(),
      }),
      scanner: new StubScanner([]),
    });

    const result = await service.discoverFromDirectory('/tmp/empty');

    expect(result.discovered).toBe(0);
    expect(result.registered).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('records failed entries when identical id and version have different content', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-discovery-'));

    try {
      await writeFile(
        join(root, 'changed.plugin-manifest.json'),
        `${JSON.stringify({ ...VALID_PLUGIN_MANIFEST, description: 'Changed description.' }, null, 2)}\n`,
        'utf8',
      );

      const repository = new InMemoryPluginCatalogRepository();
      const catalogService = new CatalogService({
        validator: new ManifestValidator(),
        repository,
      });

      await catalogService.register(VALID_PLUGIN_MANIFEST);

      const result = await new DiscoveryService({ catalogService }).discoverFromDirectory(root);

      expect(result.failed).toBe(1);
      expect(result.entries[0]?.error).toContain('already registered');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('scans nested *.plugin-manifest.json files from disk', async () => {
    const root = await mkdtemp(join(tmpdir(), 'plugin-discovery-'));

    try {
      await mkdir(join(root, 'nested'), { recursive: true });
      await writeFile(
        join(root, 'nested', 'sample.plugin-manifest.json'),
        `${JSON.stringify(VALID_PLUGIN_MANIFEST, null, 2)}\n`,
        'utf8',
      );

      const repository = new InMemoryPluginCatalogRepository();
      const result = await new DiscoveryService({
        catalogService: new CatalogService({
          validator: new ManifestValidator(),
          repository,
        }),
      }).discoverFromDirectory(root);

      expect(result.discovered).toBe(1);
      expect(result.registered).toBe(1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
