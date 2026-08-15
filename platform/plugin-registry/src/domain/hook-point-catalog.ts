/** Known hook point definition in the platform catalog. */
export interface HookPointDefinition {
  readonly id: string;
  readonly description: string;
}

/** Central hook point catalog validated against manifest hook registrations (D9). */
export const HOOK_POINT_CATALOG: readonly HookPointDefinition[] = [
  {
    id: 'theme.presets.extend',
    description: 'Preset registry extensions for the theme engine.',
  },
  {
    id: 'theme.resolve.after',
    description: 'Post-resolve theme transforms.',
  },
  {
    id: 'config.validate.after',
    description: 'Post-configuration validation side effects.',
  },
  {
    id: 'tenant.provision.after',
    description: 'Post-provision tenant side effects.',
  },
] as const;

const KNOWN_HOOK_POINT_IDS = new Set(HOOK_POINT_CATALOG.map((entry) => entry.id));

/** Return true when the hook point identifier is in the platform catalog. */
export function isKnownHookPoint(point: string): boolean {
  return KNOWN_HOOK_POINT_IDS.has(point);
}
