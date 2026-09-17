import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { TenantCatalogRepository } from '../domain/tenant-catalog-repository.js';
import type { TenantCatalogRecord } from '../domain/vertical-catalog-seeds.js';
import { InMemoryTenantCatalogRepository } from './in-memory-tenant-catalog-repository.js';

const STORE_VERSION = 1 as const;

interface CatalogStoreFile {
  version: typeof STORE_VERSION;
  catalogs: TenantCatalogRecord[];
}

export interface FileTenantCatalogRepositoryOptions {
  /** Absolute or relative path to the JSON catalog store. */
  filePath: string;
}

/**
 * Durable tenant catalog store — JSON file with in-memory indexes.
 * Writes are serialized and applied atomically (temp file + rename).
 */
export class FileTenantCatalogRepository implements TenantCatalogRepository {
  private readonly filePath: string;
  private readonly memory = new InMemoryTenantCatalogRepository();
  private loaded = false;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(options: FileTenantCatalogRepositoryOptions) {
    this.filePath = options.filePath;
  }

  async findByTenantId(tenantId: string): Promise<TenantCatalogRecord | undefined> {
    await this.ensureLoaded();
    return this.memory.findByTenantId(tenantId);
  }

  async save(record: TenantCatalogRecord): Promise<void> {
    await this.ensureLoaded();
    await this.memory.save(record);
    await this.enqueuePersist();
  }

  get path(): string {
    return this.filePath;
  }

  private enqueuePersist(): Promise<void> {
    const next = this.writeChain.then(() => this.persist());
    this.writeChain = next.catch(() => undefined);
    return next;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }

    let raw: string | undefined;
    try {
      raw = await readFile(this.filePath, 'utf8');
    } catch (err: unknown) {
      if (isNotFound(err)) {
        this.loaded = true;
        return;
      }
      throw err;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
      this.loaded = true;
      return;
    }

    const parsed = JSON.parse(trimmed) as CatalogStoreFile;
    if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.catalogs)) {
      throw new Error(
        `Invalid catalog store at '${this.filePath}': expected version ${STORE_VERSION} with catalogs[].`,
      );
    }

    for (const catalog of parsed.catalogs) {
      await this.memory.save(catalog);
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const payload: CatalogStoreFile = {
      version: STORE_VERSION,
      catalogs: this.memory.listAll(),
    };
    const json = `${JSON.stringify(payload, null, 2)}\n`;
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, json, 'utf8');
    await rename(tempPath, this.filePath);
  }
}

function isNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === 'ENOENT'
  );
}
