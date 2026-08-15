import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

import { PLUGIN_MANIFEST_FILE_SUFFIX } from '../constants.js';
import { PluginDiscoveryException } from '../errors.js';
import type { ScannedManifestFile } from '../types.js';

/** Port for scanning filesystem directories for plugin manifest files. */
export interface FilesystemManifestScanner {
  /** Recursively scan a root directory for plugin manifest files. */
  scan(rootPath: string): Promise<ScannedManifestFile[]>;
}

/** Default filesystem scanner for *.plugin-manifest.json files. */
export class DefaultFilesystemManifestScanner implements FilesystemManifestScanner {
  async scan(rootPath: string): Promise<ScannedManifestFile[]> {
    const absoluteRoot = resolve(rootPath);

    try {
      await access(absoluteRoot);
    } catch {
      throw new PluginDiscoveryException(`Discovery root path does not exist: '${absoluteRoot}'.`);
    }

    const results: ScannedManifestFile[] = [];
    await this.scanDirectory(absoluteRoot, absoluteRoot, results);
    results.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
    return results;
  }

  private async scanDirectory(
    currentPath: string,
    rootPath: string,
    results: ScannedManifestFile[],
  ): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(absolutePath, rootPath, results);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(PLUGIN_MANIFEST_FILE_SUFFIX)) {
        results.push({
          absolutePath,
          relativePath: relative(rootPath, absolutePath),
        });
      }
    }
  }
}

/** Read and parse JSON from a manifest file path. */
export async function readManifestFile(absolutePath: string): Promise<unknown> {
  const contents = await readFile(absolutePath, 'utf8');
  return JSON.parse(contents) as unknown;
}
