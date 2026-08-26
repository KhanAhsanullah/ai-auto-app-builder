import type { ConfigLayer } from '@ai-commerce/config-runtime';

/** Lifecycle status of a stored config revision. */
export type ConfigDocumentStatus = 'draft' | 'published';

/** Versioned tenant configuration document stored by the Config Engine. */
export interface ConfigDocument {
  tenantId: string;
  /** Monotonic revision number (becomes publish configVersion in Task 2). */
  version: number;
  status: ConfigDocumentStatus;
  document: ConfigLayer;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
