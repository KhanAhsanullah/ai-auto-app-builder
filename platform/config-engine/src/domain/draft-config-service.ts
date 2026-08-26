import type { ConfigRepository } from './config-repository.js';
import type { ConfigValidationService } from './config-validation-service.js';
import { ConfigDocumentNotFoundException, ConfigDraftValidationException } from '../errors.js';
import type { ConfigDocument, GetConfigInput, SaveDraftInput } from '../types.js';

export interface DraftConfigServiceDeps {
  repository: ConfigRepository;
  validation: ConfigValidationService;
  now?: () => string;
}

/**
 * Saves validated draft revisions and reads stored config documents.
 */
export class DraftConfigService {
  private readonly now: () => string;

  constructor(private readonly deps: DraftConfigServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
  }

  /** Validate and persist a new draft revision (monotonic version per tenant). */
  async saveDraft(input: SaveDraftInput): Promise<ConfigDocument> {
    const tenantId = input.tenantId.trim();
    if (!tenantId) {
      throw new ConfigDraftValidationException('tenantId cannot be empty.');
    }

    this.deps.validation.validate(input.document);

    const latest = await this.deps.repository.findLatestByTenant(tenantId);
    const version = latest ? latest.version + 1 : 1;
    const timestamp = this.now();

    const document: ConfigDocument = {
      tenantId,
      version,
      status: 'draft',
      document: structuredClone(input.document),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.repository.save(document);
    return document;
  }

  /** Get a specific revision. */
  async get(input: GetConfigInput): Promise<ConfigDocument> {
    const doc = await this.deps.repository.findByTenantAndVersion(input.tenantId, input.version);
    if (!doc) {
      throw new ConfigDocumentNotFoundException(input.tenantId, input.version);
    }
    return doc;
  }

  /** Get the latest revision for a tenant (draft or published). */
  async getLatest(tenantId: string): Promise<ConfigDocument> {
    const doc = await this.deps.repository.findLatestByTenant(tenantId.trim());
    if (!doc) {
      throw new ConfigDocumentNotFoundException(tenantId.trim());
    }
    return doc;
  }

  /** List all revisions for a tenant (ascending version). */
  async list(tenantId: string): Promise<ConfigDocument[]> {
    return this.deps.repository.listByTenant(tenantId.trim());
  }
}
