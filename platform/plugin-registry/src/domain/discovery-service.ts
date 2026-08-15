import { PluginAlreadyRegisteredException } from '../errors.js';
import type { CatalogService } from './catalog-service.js';
import type { DiscoveryEntry, DiscoveryResult } from '../types.js';
import type { FilesystemManifestScanner } from '../infrastructure/filesystem-manifest-scanner.js';
import {
  DefaultFilesystemManifestScanner,
  readManifestFile,
} from '../infrastructure/filesystem-manifest-scanner.js';

export interface DiscoveryServiceDeps {
  catalogService: CatalogService;
  scanner?: FilesystemManifestScanner;
}

/** Discovers plugin manifests on disk and registers them in the platform catalog. */
export class DiscoveryService {
  private readonly scanner: FilesystemManifestScanner;

  constructor(private readonly deps: DiscoveryServiceDeps) {
    this.scanner = deps.scanner ?? new DefaultFilesystemManifestScanner();
  }

  /** Scan a directory tree and register discovered manifests via CatalogService. */
  async discoverFromDirectory(rootPath: string): Promise<DiscoveryResult> {
    const scanned = await this.scanner.scan(rootPath);
    const entries: DiscoveryEntry[] = [];
    let registered = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of scanned) {
      try {
        const manifestInput = await readManifestFile(file.absolutePath);
        const result = await this.deps.catalogService.register(manifestInput);

        if (result.created) {
          registered += 1;
          entries.push({
            path: file.relativePath,
            status: 'registered',
            pluginId: result.pluginId,
            version: result.version,
          });
        } else {
          skipped += 1;
          entries.push({
            path: file.relativePath,
            status: 'skipped',
            pluginId: result.pluginId,
            version: result.version,
          });
        }
      } catch (error) {
        failed += 1;
        entries.push({
          path: file.relativePath,
          status: 'failed',
          error: formatDiscoveryError(error),
        });
      }
    }

    return {
      rootPath,
      discovered: scanned.length,
      registered,
      skipped,
      failed,
      entries,
    };
  }
}

function formatDiscoveryError(error: unknown): string {
  if (error instanceof PluginAlreadyRegisteredException) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown discovery error.';
}
