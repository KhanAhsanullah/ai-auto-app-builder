import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { TenantRepository } from '../domain/tenant-repository.js';
import type { TenantRecord } from '../types.js';
import { InMemoryTenantRepository } from './in-memory-tenant-repository.js';

const STORE_VERSION = 1 as const;

interface TenantStoreFile {
  version: typeof STORE_VERSION;
  tenants: TenantRecord[];
}

export interface FileTenantRepositoryOptions {
  /** Absolute or relative path to the JSON registry file. */
  filePath: string;
}

/**
 * Durable tenant registry — JSON file on disk with in-memory indexes.
 * Writes are serialized and applied atomically (temp file + rename).
 */
export class FileTenantRepository implements TenantRepository {
  private readonly filePath: string;
  private readonly memory = new InMemoryTenantRepository();
  private loaded = false;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(options: FileTenantRepositoryOptions) {
    this.filePath = options.filePath;
  }

  async findById(tenantId: string): Promise<TenantRecord | undefined> {
    await this.ensureLoaded();
    return this.memory.findById(tenantId);
  }

  async findBySlug(slug: string): Promise<TenantRecord | undefined> {
    await this.ensureLoaded();
    return this.memory.findBySlug(slug);
  }

  async list(): Promise<TenantRecord[]> {
    await this.ensureLoaded();
    return this.memory.list();
  }

  async save(record: TenantRecord): Promise<void> {
    await this.ensureLoaded();
    await this.memory.save(record);
    await this.enqueuePersist();
  }

  async update(record: TenantRecord): Promise<void> {
    await this.ensureLoaded();
    await this.memory.update(record);
    await this.enqueuePersist();
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

    const parsed = JSON.parse(trimmed) as TenantStoreFile;
    if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.tenants)) {
      throw new Error(
        `Invalid tenant store at '${this.filePath}': expected version ${STORE_VERSION} with tenants[].`,
      );
    }

    for (const tenant of parsed.tenants) {
      await this.memory.save(tenant);
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const payload: TenantStoreFile = {
      version: STORE_VERSION,
      tenants: this.memory.listAll(),
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
