import { describe, expect, it } from 'vitest';

import { ConfigDocumentNotFoundException, ConfigDraftValidationException } from '../src/errors.js';
import { createDraftConfigService, loadFullTenantConfigLayer } from './helpers.js';

describe('DraftConfigService', () => {
  it('saves monotonic draft revisions after validation', async () => {
    const { drafts } = createDraftConfigService();
    const layer = loadFullTenantConfigLayer();

    const first = await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: layer,
    });
    const second = await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: layer,
    });

    expect(first).toMatchObject({
      tenantId: 'tenant-fresh',
      version: 1,
      status: 'draft',
    });
    expect(second.version).toBe(2);

    await expect(drafts.get({ tenantId: 'tenant-fresh', version: 1 })).resolves.toEqual(first);
    await expect(drafts.getLatest('tenant-fresh')).resolves.toMatchObject({ version: 2 });
    await expect(drafts.list('tenant-fresh')).resolves.toHaveLength(2);
  });

  it('rejects empty tenantId', async () => {
    const { drafts } = createDraftConfigService();
    await expect(
      drafts.saveDraft({ tenantId: '  ', document: loadFullTenantConfigLayer() }),
    ).rejects.toThrow(ConfigDraftValidationException);
  });

  it('throws when a revision is missing', async () => {
    const { drafts } = createDraftConfigService();
    await expect(drafts.get({ tenantId: 'missing', version: 1 })).rejects.toThrow(
      ConfigDocumentNotFoundException,
    );
    await expect(drafts.getLatest('missing')).rejects.toThrow(ConfigDocumentNotFoundException);
  });
});
