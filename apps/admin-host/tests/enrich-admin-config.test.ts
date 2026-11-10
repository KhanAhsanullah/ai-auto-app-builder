import { describe, expect, it } from 'vitest';

import { enrichAdminConfigDocument } from '../src/enrich-admin-config.js';

describe('enrichAdminConfigDocument', () => {
  it('adds catalog module flag and nav item', () => {
    const enriched = enrichAdminConfigDocument({
      navigation: {
        admin: {
          primary: [{ id: 'dashboard', label: 'Dashboard', route: 'admin.dashboard' }],
        },
      },
    });

    const featureFlags = enriched.featureFlags as {
      modules: { catalog: boolean };
    };
    expect(featureFlags.modules.catalog).toBe(true);

    const admin = (enriched.navigation as { admin: { primary: Array<{ route: string }> } }).admin;
    expect(admin.primary.some((item) => item.route === 'admin.catalog')).toBe(true);
  });

  it('does not duplicate catalog nav', () => {
    const enriched = enrichAdminConfigDocument({
      navigation: {
        admin: {
          primary: [{ id: 'catalog', label: 'Catalog', route: 'admin.catalog' }],
        },
      },
      featureFlags: { modules: { catalog: true }, flags: {} },
    });
    const admin = (enriched.navigation as { admin: { primary: unknown[] } }).admin;
    expect(admin.primary).toHaveLength(1);
  });
});
