import { describe, expect, it } from 'vitest';

import { createBuildOrchestrator } from '../src/infrastructure/create-build-orchestrator.js';
import { BuildJobNotFoundException } from '../src/errors.js';
import { createTestBuildRequest } from './helpers.js';

describe('BuildOrchestrator / createBuildOrchestrator', () => {
  it('enqueues a queued job with a plan', async () => {
    const orchestrator = createBuildOrchestrator({
      createJobId: () => 'job-facade-1',
      now: () => '2026-08-26T14:00:00.000Z',
    });

    const job = await orchestrator.enqueue(
      createTestBuildRequest({ surfaces: ['web'], reason: undefined }),
    );

    expect(job.id).toBe('job-facade-1');
    expect(job.status).toBe('queued');
    expect(job.request.reason).toBe('manual');
    expect(job.plan?.surfaces).toEqual(['web']);
    expect(job.plan?.steps).toHaveLength(4);
  });

  it('onConfigPublish enqueues and executes a full rebuild', async () => {
    const orchestrator = createBuildOrchestrator({
      createJobId: () => 'job-publish-1',
      now: () => '2026-08-26T14:00:00.000Z',
      hash: (input) => `h:${input}`,
    });

    const result = await orchestrator.onConfigPublish({
      tenantId: 'tenant-fresh',
      configVersion: 7,
      publishId: 'pub-123',
      surfaces: ['admin', 'api'],
    });

    expect(result.job.status).toBe('succeeded');
    expect(result.job.request.reason).toBe('config_publish');
    expect(result.job.request.publishId).toBe('pub-123');
    expect(result.artifacts).toHaveLength(2);

    const stored = await orchestrator.getJob('job-publish-1');
    expect(stored.status).toBe('succeeded');

    const artifacts = await orchestrator.getArtifactsForJob('job-publish-1');
    expect(artifacts).toHaveLength(2);

    const jobs = await orchestrator.listJobsByTenant('tenant-fresh');
    expect(jobs).toHaveLength(1);
  });

  it('enqueueAndExecute runs a manual rebuild end-to-end', async () => {
    const orchestrator = createBuildOrchestrator({
      createJobId: () => 'job-manual-1',
      now: () => '2026-08-26T14:00:00.000Z',
    });

    const result = await orchestrator.enqueueAndExecute(
      createTestBuildRequest({ surfaces: ['mobile'], reason: 'manual' }),
    );

    expect(result.job.status).toBe('succeeded');
    expect(result.artifacts[0]?.surface).toBe('mobile');
  });

  it('getJob throws when missing', async () => {
    const orchestrator = createBuildOrchestrator();
    await expect(orchestrator.getJob('missing')).rejects.toThrow(BuildJobNotFoundException);
  });
});
