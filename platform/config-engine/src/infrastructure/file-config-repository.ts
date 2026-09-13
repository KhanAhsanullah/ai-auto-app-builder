import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { ConfigRepository } from '../domain/config-repository.js';
import type { ConfigDocument } from '../types.js';
import { InMemoryConfigRepository } from './in-memory-config-repository.js';

const STORE_VERSION = 1 as const;

interface ConfigStoreFile {
  version: typeof STORE_VERSION;
  documents: ConfigDocument[];
}

export interface FileConfigRepositoryOptions {
  /** Absolute or relative path to the JSON revision store. */
  filePath: string;
}

/**
 * Durable config revision store — JSON file on disk with in-memory indexes.
 * Writes are serialized and applied atomically (temp file + rename).
 */
export class FileConfigRepository implements ConfigRepository {
  private readonly filePath: string;
  private readonly memory = new InMemoryConfigRepository();
  private loaded = false;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(options: FileConfigRepositoryOptions) {
    this.filePath = options.filePath;
  }

  async save(document: ConfigDocument): Promise<void> {
    await this.ensureLoaded();
    await this.memory.save(document);
    await this.enqueuePersist();
  }

  async update(document: ConfigDocument): Promise<void> {
    await this.ensureLoaded();
    await this.memory.update(document);
    await this.enqueuePersist();
  }

  async findByTenantAndVersion(
    tenantId: string,
    version: number,
  ): Promise<ConfigDocument | undefined> {
    await this.ensureLoaded();
    return this.memory.findByTenantAndVersion(tenantId, version);
  }

  async findLatestByTenant(tenantId: string): Promise<ConfigDocument | undefined> {
    await this.ensureLoaded();
    return this.memory.findLatestByTenant(tenantId);
  }

  async findLatestDraftByTenant(tenantId: string): Promise<ConfigDocument | undefined> {
    await this.ensureLoaded();
    return this.memory.findLatestDraftByTenant(tenantId);
  }

  async findLatestPublishedByTenant(tenantId: string): Promise<ConfigDocument | undefined> {
    await this.ensureLoaded();
    return this.memory.findLatestPublishedByTenant(tenantId);
  }

  async listByTenant(tenantId: string): Promise<ConfigDocument[]> {
    await this.ensureLoaded();
    return this.memory.listByTenant(tenantId);
  }

  /** Absolute path for the backing store (tests / ops). */
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

    const parsed = JSON.parse(trimmed) as ConfigStoreFile;
    if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.documents)) {
      throw new Error(
        `Invalid config store at '${this.filePath}': expected version ${STORE_VERSION} with documents[].`,
      );
    }

    for (const document of parsed.documents) {
      await this.memory.save(document);
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const payload: ConfigStoreFile = {
      version: STORE_VERSION,
      documents: this.memory.listAll(),
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
