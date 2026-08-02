import { describe, expect, it } from 'vitest';

import { LivePreviewCoordinator } from '../src/domain/live-preview.js';
import { PRIMARY_OVERRIDE } from './helpers.js';

describe('LivePreviewCoordinator', () => {
  const coordinator = new LivePreviewCoordinator();

  it('previews draft patch without persisting', () => {
    const base = { tenantTheme: { preset: 'modern' as const } };
    const preview = coordinator.preview(base, PRIMARY_OVERRIDE);

    expect(preview.preview).toBe(true);
    expect(preview.draftPatch).toEqual(PRIMARY_OVERRIDE);
    expect(preview.theme.colors.primary).toBe('#FF0000');
  });

  it('uses same resolver pipeline as production resolve', () => {
    const base = { tenantTheme: { preset: 'modern' as const } };
    const resolved = coordinator.getResolver().resolve(base);
    const preview = coordinator.preview(base, {});

    expect(preview.theme.preset).toBe(resolved.theme.preset);
    expect(preview.metadata.hash).toBe(resolved.metadata.hash);
  });

  it('updates hash when preview patch changes tokens', () => {
    const base = { tenantTheme: { preset: 'modern' as const } };
    const previewA = coordinator.preview(base, { colors: { primary: '#111111' } });
    const previewB = coordinator.preview(base, { colors: { primary: '#222222' } });

    expect(previewA.metadata.hash).not.toBe(previewB.metadata.hash);
  });

  it('supports skipMetadata option', () => {
    const result = coordinator.preview({ tenantTheme: { preset: 'modern' } }, PRIMARY_OVERRIDE, {
      skipMetadata: true,
    });

    expect(result.metadata.compiledAt).toBeDefined();
    expect(result.preview).toBe(true);
  });
});
