import { describe, expect, it } from 'vitest';

import { BuildExecutor } from '../src/domain/build-executor.js';
import { BuildPlanner } from '../src/domain/build-planner.js';
import { InMemoryArtifactStore } from '../src/infrastructure/in-memory-artifact-store.js';
import { InMemoryBuildJobRepository } from '../src/infrastructure/in-memory-build-job-repository.js';
import { BuildOrchestratorException } from '../src/errors.js';
import { createTestBuildJob, createTestBuildRequest } from './helpers.js';

describe('BuildExecutor', () => {
  function createExecutor() {
    const jobs = new InMemoryBuildJobRepository();
    const artifacts = new InMemoryArtifactStore();
    const executor = new BuildExecutor({
      jobs,
      artifacts,
      now: () => '2026-08-26T13:00:00.000Z',
      hash: (input) => `hash:${input}`,
    });
    return { jobs, artifacts, executor };
  }

  it('executes a queued job and emits surface_bundle artifacts', async () => {
    const { jobs, artifacts, executor } = createExecutor();
    const request = createTestBuildRequest({ surfaces: ['web', 'admin'] });
    const plan = new BuildPlanner().plan(request);

    await jobs.save(
      createTestBuildJob({
        request,
        plan,
      }),
    );

    const result = await executor.execute('job-1');

    expect(result.job.status).toBe('succeeded');
    expect(result.job.completedStepIds).toHaveLength(8);
    expect(result.artifacts).toHaveLength(2);
    expect(result.artifacts.map((a) => a.surface)).toEqual(['admin', 'web']);
    expect(result.artifacts[0]?.kind).toBe('surface_bundle');
    expect(result.artifacts[0]?.contentHash).toContain('tenant-fresh:3:admin:surface_bundle');

    const stored = await artifacts.findByJobId('job-1');
    expect(stored).toHaveLength(2);

    const persisted = await jobs.findById('job-1');
    expect(persisted?.status).toBe('succeeded');
    expect(persisted?.artifactIds).toEqual(result.job.artifactIds);
  });

  it('plans automatically when the queued job has no plan', async () => {
    const { jobs, executor } = createExecutor();
    await jobs.save(createTestBuildJob({ request: createTestBuildRequest({ surfaces: ['api'] }) }));

    const result = await executor.execute('job-1');
    expect(result.job.plan?.surfaces).toEqual(['api']);
    expect(result.artifacts).toHaveLength(1);
    expect(result.artifacts[0]?.surface).toBe('api');
  });

  it('rejects jobs that are not queued', async () => {
    const { jobs, executor } = createExecutor();
    await jobs.save(createTestBuildJob({ status: 'running' }));

    await expect(executor.execute('job-1')).rejects.toThrow(BuildOrchestratorException);
  });

  it('marks the job failed when a step throws', async () => {
    const jobs = new InMemoryBuildJobRepository();
    const artifacts = new InMemoryArtifactStore();
    const executor = new BuildExecutor({
      jobs,
      artifacts,
      now: () => '2026-08-26T13:00:00.000Z',
      hash: () => {
        throw new Error('hash boom');
      },
    });

    await jobs.save(
      createTestBuildJob({
        request: createTestBuildRequest({ surfaces: ['mobile'] }),
      }),
    );

    await expect(executor.execute('job-1')).rejects.toThrow('hash boom');
    const failed = await jobs.findById('job-1');
    expect(failed?.status).toBe('failed');
    expect(failed?.errorMessage).toBe('hash boom');
  });
});
