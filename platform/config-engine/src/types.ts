import type { ConfigLayer } from '@ai-commerce/config-runtime';

/** Lifecycle status of a stored config revision. */
export type ConfigDocumentStatus = 'draft' | 'published';

/** Surfaces that may be rebuilt after publish (aligned with Build Orchestrator). */
export type ConfigPublishSurface = 'admin' | 'web' | 'mobile' | 'api';

/** Versioned tenant configuration document stored by the Config Engine. */
export interface ConfigDocument {
  tenantId: string;
  /** Monotonic revision number (becomes publish configVersion). */
  version: number;
  status: ConfigDocumentStatus;
  document: ConfigLayer;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishId?: string;
}

/** Input for saving a new draft revision. */
export interface SaveDraftInput {
  tenantId: string;
  document: ConfigLayer;
}

/** Input for reading a revision. */
export interface GetConfigInput {
  tenantId: string;
  version: number;
}

/** Input for publishing a draft revision. */
export interface PublishConfigInput {
  tenantId: string;
  /** Draft version to publish (defaults to latest draft for the tenant). */
  version?: number;
  /** Optional surface subset for rebuild targeting. */
  surfaces?: readonly ConfigPublishSurface[];
}

/**
 * Event emitted after a successful publish.
 * Shape matches `@ai-commerce/build-orchestrator` `ConfigPublishEvent`.
 */
export interface ConfigPublishEvent {
  tenantId: string;
  configVersion: number;
  publishId: string;
  surfaces?: readonly ConfigPublishSurface[];
}

/** Result of a publish operation. */
export interface PublishConfigResult {
  document: ConfigDocument;
  event: ConfigPublishEvent;
}
