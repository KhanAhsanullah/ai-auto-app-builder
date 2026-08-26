import type { DraftConfigService } from './draft-config-service.js';
import type { PublishConfigService } from './publish-config-service.js';
import type {
  ConfigDocument,
  GetConfigInput,
  PublishConfigInput,
  PublishConfigResult,
  SaveDraftInput,
} from '../types.js';

export interface ConfigEngineDeps {
  drafts: DraftConfigService;
  publish: PublishConfigService;
}

/**
 * Public facade for tenant config drafts and publish:
 * save/get/list drafts, publish, and read published revisions.
 */
export class ConfigEngine {
  constructor(private readonly deps: ConfigEngineDeps) {}

  /** Validate and persist a new draft revision. */
  async saveDraft(input: SaveDraftInput): Promise<ConfigDocument> {
    return this.deps.drafts.saveDraft(input);
  }

  /** Get a specific revision. */
  async get(input: GetConfigInput): Promise<ConfigDocument> {
    return this.deps.drafts.get(input);
  }

  /** Get the latest revision for a tenant (draft or published). */
  async getLatest(tenantId: string): Promise<ConfigDocument> {
    return this.deps.drafts.getLatest(tenantId);
  }

  /** List all revisions for a tenant (ascending version). */
  async list(tenantId: string): Promise<ConfigDocument[]> {
    return this.deps.drafts.list(tenantId);
  }

  /** Publish a draft revision and emit ConfigPublishEvent. */
  async publish(input: PublishConfigInput): Promise<PublishConfigResult> {
    return this.deps.publish.publish(input);
  }

  /** Latest published revision for a tenant. */
  async getLatestPublished(tenantId: string): Promise<ConfigDocument> {
    return this.deps.publish.getLatestPublished(tenantId);
  }
}
