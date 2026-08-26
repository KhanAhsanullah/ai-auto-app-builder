import { describe, expect, it } from 'vitest';

import { InMemoryArtifactStore } from '../src/infrastructure/in-memory-artifact-store.js';
import { BuildOrchestratorException } from '../src/errors.js';
import type { BuildArtifactRef } from '../src/domain/build-artifact.js';

describe('InMemoryArtifactStore', () => {
  const sample: BuildArtifactRef = {
    id: 'job-1.web.surface_bundle',
    jobId: 'job-1',
    tenantId: 'tenant-fresh',
    surface: 'web',
    kind: 'surface_bundle',
    contentHash: 'abc',
    configVersion: 3,
    producedAt: '2026-08-26T13:00:00.000Z',
  };

  it('saves and finds by id, job, and tenant', async () => {
    const store = new InMemoryArtifactStore();
    await store.save(sample);

    await expect(store.findById(sample.id)).resolves.toEqual(sample);
    await expect(store.findByJobId('job-1')).resolves.toEqual([sample]);
    await expect(store.findByTenantId('tenant-fresh')).resolves.toEqual([sample]);
  });

  it('rejects duplicate artifact ids', async () => {
    const store = new InMemoryArtifactStore();
    await store.save(sample);
    await expect(store.save(sample)).rejects.toThrow(BuildOrchestratorException);
  });
});
