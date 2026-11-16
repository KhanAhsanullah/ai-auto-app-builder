import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type {
  TenantOrderRepository,
  TenantOrdersRecord,
} from '../domain/tenant-order-repository.js';
import { InMemoryTenantOrderRepository } from './in-memory-tenant-order-repository.js';

const STORE_VERSION = 1 as const;

interface OrderStoreFile {
  version: typeof STORE_VERSION;
  tenants: TenantOrdersRecord[];
}

export interface FileTenantOrderRepositoryOptions {
  /** Absolute or relative path to the JSON order store. */
  filePath: string;
}

/**
 * Durable tenant order store — JSON file with in-memory indexes.
 * Writes are serialized and applied atomically (temp file + rename).
 */
export class FileTenantOrderRepository implements TenantOrderRepository {
  private readonly filePath: string;
  private readonly memory = new InMemoryTenantOrderRepository();
  private loaded = false;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(options: FileTenantOrderRepositoryOptions) {
    this.filePath = options.filePath;
  }

  async findByTenantId(tenantId: string): Promise<TenantOrdersRecord | undefined> {
    await this.ensureLoaded();
    return this.memory.findByTenantId(tenantId);
  }

  async save(record: TenantOrdersRecord): Promise<void> {
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

    const parsed = JSON.parse(trimmed) as OrderStoreFile;
    if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.tenants)) {
      throw new Error(
        `Invalid order store at '${this.filePath}': expected version ${STORE_VERSION} with tenants[].`,
      );
    }

    for (const record of parsed.tenants) {
      await this.memory.save(record);
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const payload: OrderStoreFile = {
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
