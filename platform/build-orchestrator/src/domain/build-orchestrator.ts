import { randomUUID } from 'node:crypto';

import type { ArtifactStore } from './artifact-store.js';
import type { BuildArtifactRef } from './build-artifact.js';
import type { BuildJobRepository } from './build-job-repository.js';
import type { BuildExecutionResult, BuildExecutor } from './build-executor.js';
import type { BuildPlanner } from './build-planner.js';
import { BuildJobNotFoundException } from '../errors.js';
import type { BuildJob, BuildRequest, BuildSurface } from '../types.js';

/** Event shape for a published tenant config (Config Engine contract, Task 3). */
export interface ConfigPublishEvent {
  tenantId: string;
  configVersion: number;
  publishId: string;
  /** Optional surface subset; defaults to all four. */
  surfaces?: readonly BuildSurface[];
}

export interface BuildOrchestratorDeps {
  jobs: BuildJobRepository;
  artifacts: ArtifactStore;
  planner: BuildPlanner;
  executor: BuildExecutor;
  now?: () => string;
  createJobId?: () => string;
}

/**
 * Public facade for config-publish-triggered rebuilds:
 * enqueue jobs, execute plans, and look up jobs/artifacts.
 */
export class BuildOrchestrator {
  private readonly now: () => string;
  private readonly createJobId: () => string;

  constructor(private readonly deps: BuildOrchestratorDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createJobId = deps.createJobId ?? (() => randomUUID());
  }

  /** Enqueue a queued build job from a request (does not execute). */
  async enqueue(request: BuildRequest): Promise<BuildJob> {
    const plan = this.deps.planner.plan(request);
    const timestamp = this.now();
    const job: BuildJob = {
      id: this.createJobId(),
      tenantId: request.tenantId,
      request: {
        ...request,
        reason: request.reason ?? 'manual',
      },
      status: 'queued',
      plan,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.jobs.save(job);
    return job;
  }

  /** Execute a previously queued job. */
  async execute(jobId: string): Promise<BuildExecutionResult> {
    return this.deps.executor.execute(jobId);
  }

  /** Enqueue + execute in one call (manual / retry flows). */
  async enqueueAndExecute(request: BuildRequest): Promise<BuildExecutionResult> {
    const job = await this.enqueue(request);
    return this.execute(job.id);
  }

  /**
   * Handle a Config Engine publish event: enqueue a config_publish job and execute it.
   */
  async onConfigPublish(event: ConfigPublishEvent): Promise<BuildExecutionResult> {
    return this.enqueueAndExecute({
      tenantId: event.tenantId,
      configVersion: event.configVersion,
      publishId: event.publishId,
      surfaces: event.surfaces,
      reason: 'config_publish',
    });
  }

  /** Look up a build job by id. */
  async getJob(jobId: string): Promise<BuildJob> {
    const job = await this.deps.jobs.findById(jobId);
    if (!job) {
      throw new BuildJobNotFoundException(jobId);
    }
    return job;
  }

  /** List jobs for a tenant. */
  async listJobsByTenant(tenantId: string): Promise<BuildJob[]> {
    return this.deps.jobs.findByTenantId(tenantId);
  }

  /** List artifact descriptors for a job. */
  async getArtifactsForJob(jobId: string): Promise<BuildArtifactRef[]> {
    return this.deps.artifacts.findByJobId(jobId);
  }
}
