import { ConfigProvider } from '@ai-commerce/config-runtime';
import { themeSchema } from '@ai-commerce/config-schema';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { createTestThemeProvider } from './helpers.js';
import { BUNDLED_PRESETS } from '../src/defaults/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const FULL_EXAMPLE_PATH = join(REPO_ROOT, 'schemas/tenant-config/v1/examples/full.example.json');
const SCHEMAS_PRESETS = join(REPO_ROOT, 'schemas/theme/v1/presets');

describe('Config Runtime integration', () => {
  const configProvider = new ConfigProvider({ cache: false });
  const themeProvider = createTestThemeProvider();

  it('resolves theme from ConfigProvider result via ThemeProvider', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const themeResult = themeProvider.provideFromProviderResult(configResult);

    expect(themeResult.resolved.theme.preset).toBe('modern');
    expect(themeResult.resolved.theme.colors.primary).toBe('#16A34A');
    expect(themeResult.resolved.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(themeResult.artifacts.css.surface).toBe('css');
  });

  it('validates schema preset files match bundled presets', () => {
    for (const preset of ['default', 'minimal', 'modern', 'luxury', 'dark'] as const) {
      const schemaFile = JSON.parse(readFileSync(join(SCHEMAS_PRESETS, `${preset}.json`), 'utf8'));
      const bundled = BUNDLED_PRESETS[preset];

      expect(themeSchema.safeParse(schemaFile).success).toBe(true);
      expect(schemaFile.preset).toBe(bundled.preset);
      expect(schemaFile.colors.primary).toBe(bundled.colors?.primary);
    }
  });
});
