import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConfigProvider, type ConfigLayer } from '@ai-commerce/config-runtime';

import { ConfigValidationService } from '../src/domain/config-validation-service.js';
import { DraftConfigService } from '../src/domain/draft-config-service.js';
import { InMemoryConfigRepository } from '../src/infrastructure/in-memory-config-repository.js';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '../../..');

export const FULL_TENANT_CONFIG_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/full.example.json',
);

export function loadFullTenantConfigLayer(): ConfigLayer {
  return JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8')) as ConfigLayer;
}

export function createDraftConfigService(now = () => '2026-08-26T18:00:00.000Z') {
  const repository = new InMemoryConfigRepository();
  const validation = new ConfigValidationService({
    configProvider: new ConfigProvider({ cache: false }),
  });
  const drafts = new DraftConfigService({ repository, validation, now });
  return { repository, validation, drafts };
}
