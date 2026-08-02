import { describe, expect, it } from 'vitest';

import { PresetRegistry } from '../src/domain/preset-registry.js';
import { PresetNotFoundException } from '../src/errors.js';

describe('PresetRegistry', () => {
  it('lists all built-in presets', () => {
    const registry = new PresetRegistry();
    expect(registry.list().sort()).toEqual(['dark', 'default', 'luxury', 'minimal', 'modern']);
  });

  it('returns a cloned preset template', () => {
    const registry = new PresetRegistry();
    const modern = registry.get('modern');
    expect(modern.preset).toBe('modern');
    expect(modern.colors?.primary).toBe('#16A34A');

    modern.colors!.primary = '#000000';
    expect(registry.get('modern').colors?.primary).toBe('#16A34A');
  });

  it('throws for unknown preset', () => {
    const registry = new PresetRegistry();
    expect(() => registry.get('unknown' as 'modern')).toThrow(PresetNotFoundException);
  });

  it('allows registering custom preset templates via extension point', () => {
    const registry = new PresetRegistry();
    registry.register('minimal', {
      preset: 'minimal',
      colors: { primary: '#ABCDEF' } as never,
    });

    expect(registry.get('minimal').colors?.primary).toBe('#ABCDEF');
  });
});
