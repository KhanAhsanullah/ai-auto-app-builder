import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '../../..');

/** Path to the canonical full tenant configuration example. */
export const FULL_EXAMPLE_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/full.example.json',
);
