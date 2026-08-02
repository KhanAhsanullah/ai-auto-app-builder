import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ConfigLoader } from '../src/config-loader.js';
import { ConfigLoadException } from '../src/errors.js';

describe('ConfigLoader', () => {
  const loader = new ConfigLoader();

  it('parses valid JSON objects', () => {
    const parsed = loader.parseJson('{"tenant":{"slug":"demo"}}');
    expect(parsed).toEqual({ tenant: { slug: 'demo' } });
  });

  it('rejects non-object JSON roots by default', () => {
    expect(() => loader.parseJson('[1, 2, 3]')).toThrow(ConfigLoadException);
    expect(() => loader.parseJson('null')).toThrow(ConfigLoadException);
  });

  it('allows non-object roots when configured', () => {
    expect(loader.parseJson('[1, 2, 3]', { requireObject: false })).toEqual([1, 2, 3]);
  });

  it('loads configuration from files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'config-runtime-'));
    const filePath = join(dir, 'tenant.json');
    await writeFile(filePath, '{"tenant":{"slug":"from-file"}}', 'utf-8');

    await expect(loader.loadFromFile(filePath)).resolves.toEqual({
      tenant: { slug: 'from-file' },
    });
  });

  it('wraps invalid JSON with ConfigLoadException', () => {
    expect(() => loader.parseJson('{invalid')).toThrow(ConfigLoadException);
  });
});
