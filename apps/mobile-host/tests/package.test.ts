import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, '../package.json'), 'utf8')) as {
  name: string;
  dependencies: Record<string, string>;
  main: string;
};

describe('@ai-commerce/mobile-host package', () => {
  it('is an Expo host wired to @ai-commerce/mobile-app', () => {
    expect(pkg.name).toBe('@ai-commerce/mobile-host');
    expect(pkg.main).toBe('index.js');
    expect(pkg.dependencies['@ai-commerce/mobile-app']).toBe('workspace:*');
    expect(pkg.dependencies.expo).toBeTruthy();
    expect(pkg.dependencies['expo-sqlite']).toBeTruthy();
    expect(pkg.dependencies['react-native']).toBeTruthy();
  });
});
