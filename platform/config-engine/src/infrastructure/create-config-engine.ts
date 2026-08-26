import { ConfigProvider } from '@ai-commerce/config-runtime';

import type { ConfigRepository } from '../domain/config-repository.js';
import {
  InMemoryConfigPublishEmitter,
  type ConfigPublishEmitter,
  type ConfigPublishListener,
} from '../domain/config-publish-emitter.js';
import { ConfigEngine } from '../domain/config-engine.js';
import { ConfigValidationService } from '../domain/config-validation-service.js';
import { DraftConfigService } from '../domain/draft-config-service.js';
import { PublishConfigService } from '../domain/publish-config-service.js';
import { InMemoryConfigRepository } from './in-memory-config-repository.js';

export interface CreateConfigEngineOptions {
  repository?: ConfigRepository;
  validation?: ConfigValidationService;
  /** Override ConfigProvider when using the default validation service. */
  configProvider?: ConfigProvider;
  emitter?: ConfigPublishEmitter;
  /** Convenience: wire listeners into the default in-memory emitter. */
  onPublish?: readonly ConfigPublishListener[];
  now?: () => string;
  createPublishId?: () => string;
}

/**
 * Wire a ConfigEngine with in-memory defaults (or injected ports).
 */
export function createConfigEngine(options: CreateConfigEngineOptions = {}): ConfigEngine {
  const repository = options.repository ?? new InMemoryConfigRepository();
  const validation =
    options.validation ??
    new ConfigValidationService({
      configProvider: options.configProvider ?? new ConfigProvider({ cache: false }),
    });
  const emitter = options.emitter ?? new InMemoryConfigPublishEmitter(options.onPublish ?? []);

  const drafts = new DraftConfigService({
    repository,
    validation,
    now: options.now,
  });
  const publish = new PublishConfigService({
    repository,
    validation,
    emitter,
    now: options.now,
    createPublishId: options.createPublishId,
  });

  return new ConfigEngine({ drafts, publish });
}
