import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, '../package.json'), 'utf8')) as {
  name: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
};

describe('@ai-commerce/web-host package', () => {
  it('is a Vite host wired to @ai-commerce/web-store', () => {
    expect(pkg.name).toBe('@ai-commerce/web-host');
    expect(pkg.dependencies['@ai-commerce/web-store']).toBe('workspace:*');
    expect(pkg.dependencies.react).toBeTruthy();
    expect(pkg.scripts.dev).toContain('vite');
    expect(pkg.scripts.start).toContain('vite');
  });
});
