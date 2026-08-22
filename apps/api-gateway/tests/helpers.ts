import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ConfigLayer } from '@ai-commerce/config-runtime';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '../../..');

export const FULL_TENANT_CONFIG_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/full.example.json',
);

export const TENANT = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'demo-grocery',
};

export function loadFullTenantConfig(): ConfigLayer {
  return JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8')) as ConfigLayer;
}
