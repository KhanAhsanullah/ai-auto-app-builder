import { randomUUID } from 'node:crypto';

import type { ConfigLayer } from '@ai-commerce/config-runtime';

import type { ConfigPublishEmitter } from './config-publish-emitter.js';
import type { ConfigRepository } from './config-repository.js';
import type { ConfigValidationService } from './config-validation-service.js';
import {
  ConfigDocumentNotFoundException,
  ConfigDraftValidationException,
  ConfigPublishException,
} from '../errors.js';
import type {
  ConfigDocument,
  ConfigPublishEvent,
  PublishConfigInput,
  PublishConfigResult,
} from '../types.js';

export interface PublishConfigServiceDeps {
  repository: ConfigRepository;
  validation: ConfigValidationService;
  emitter?: ConfigPublishEmitter;
  now?: () => string;
  createPublishId?: () => string;
}

/**
 * Publishes a draft revision: re-validate, stamp meta.configVersion, emit ConfigPublishEvent.
 */
export class PublishConfigService {
  private readonly now: () => string;
  private readonly createPublishId: () => string;

  constructor(private readonly deps: PublishConfigServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createPublishId = deps.createPublishId ?? (() => randomUUID());
  }

  /** Publish a draft revision (explicit version or latest draft). */
  async publish(input: PublishConfigInput): Promise<PublishConfigResult> {
    const tenantId = input.tenantId.trim();
    if (!tenantId) {
      throw new ConfigDraftValidationException('tenantId cannot be empty.');
    }

    const draft = await this.resolveDraft(tenantId, input.version);
    this.deps.validation.validate(draft.document);

    const publishId = this.createPublishId();
    const publishedAt = this.now();
    const stampedDocument = this.stampConfigVersion(draft.document, draft.version);

    const published: ConfigDocument = {
      ...draft,
      status: 'published',
      document: stampedDocument,
      publishId,
      publishedAt,
      updatedAt: publishedAt,
    };

    await this.deps.repository.update(published);

    const event: ConfigPublishEvent = {
      tenantId,
      configVersion: draft.version,
      publishId,
      ...(input.surfaces ? { surfaces: input.surfaces } : {}),
    };

    if (this.deps.emitter) {
      await this.deps.emitter.emit(event);
    }

    return { document: published, event };
  }

  /** Latest published revision for a tenant. */
  async getLatestPublished(tenantId: string): Promise<ConfigDocument> {
    const doc = await this.deps.repository.findLatestPublishedByTenant(tenantId.trim());
    if (!doc) {
      throw new ConfigDocumentNotFoundException(tenantId.trim());
    }
    return doc;
  }

  private async resolveDraft(tenantId: string, version?: number): Promise<ConfigDocument> {
    if (version !== undefined) {
      const doc = await this.deps.repository.findByTenantAndVersion(tenantId, version);
      if (!doc) {
        throw new ConfigDocumentNotFoundException(tenantId, version);
      }
      if (doc.status !== 'draft') {
        throw new ConfigPublishException(
          `Config version ${version} for tenant '${tenantId}' is already '${doc.status}'.`,
          tenantId,
          version,
        );
      }
      return doc;
    }

    const draft = await this.deps.repository.findLatestDraftByTenant(tenantId);
    if (!draft) {
      throw new ConfigPublishException(
        `No draft config found to publish for tenant '${tenantId}'.`,
        tenantId,
      );
    }
    return draft;
  }

  private stampConfigVersion(document: ConfigLayer, version: number): ConfigLayer {
    const meta =
      document.meta && typeof document.meta === 'object' && !Array.isArray(document.meta)
        ? { ...document.meta, configVersion: version }
        : { schemaVersion: 'v1' as const, configVersion: version };

    return {
      ...structuredClone(document),
      meta,
    };
  }
}
