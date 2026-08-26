import { describe, expect, it } from 'vitest';

import { InMemoryBuildJobRepository } from '../src/infrastructure/in-memory-build-job-repository.js';
import {
  BuildJobAlreadyExistsException,
  BuildJobNotFoundException,
  InvalidBuildJobTransitionException,
} from '../src/errors.js';
import { createTestBuildJob } from './helpers.js';

describe('InMemoryBuildJobRepository', () => {
  it('saves and finds jobs by id and tenant', async () => {
    const repo = new InMemoryBuildJobRepository();
    const job = createTestBuildJob();

    await repo.save(job);

    await expect(repo.findById('job-1')).resolves.toEqual(job);
    await expect(repo.findByTenantId('tenant-fresh')).resolves.toEqual([job]);
  });

  it('rejects duplicate saves', async () => {
    const repo = new InMemoryBuildJobRepository();
    const job = createTestBuildJob();
    await repo.save(job);

    await expect(repo.save(job)).rejects.toThrow(BuildJobAlreadyExistsException);
  });

  it('updates status along the allowed path', async () => {
    const repo = new InMemoryBuildJobRepository();
    await repo.save(createTestBuildJob());

    await repo.update({
      ...createTestBuildJob(),
      status: 'planning',
      updatedAt: '2026-08-26T12:01:00.000Z',
    });

    const updated = await repo.findById('job-1');
    expect(updated?.status).toBe('planning');
  });

  it('rejects illegal status transitions and missing jobs', async () => {
    const repo = new InMemoryBuildJobRepository();
    await repo.save(createTestBuildJob());

    await expect(
      repo.update({
        ...createTestBuildJob(),
        status: 'succeeded',
      }),
    ).rejects.toThrow(InvalidBuildJobTransitionException);

    await expect(
      repo.update({
        ...createTestBuildJob({ id: 'missing' }),
        status: 'planning',
      }),
    ).rejects.toThrow(BuildJobNotFoundException);
  });
});
