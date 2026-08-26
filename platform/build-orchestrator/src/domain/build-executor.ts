import { createHash } from 'node:crypto';

import type { ArtifactStore } from './artifact-store.js';
import type { BuildArtifactKind, BuildArtifactRef } from './build-artifact.js';
import type { BuildJobRepository } from './build-job-repository.js';
import { BuildPlanner } from './build-planner.js';
import { BuildJobNotFoundException, BuildOrchestratorException } from '../errors.js';
import type { BuildJob, BuildPlanStep } from '../types.js';

export interface BuildExecutorDeps {
  jobs: BuildJobRepository;
  artifacts: ArtifactStore;
  planner?: BuildPlanner;
  now?: () => string;
  /** Override content hashing (tests). */
  hash?: (input: string) => string;
}

export interface BuildExecutionResult {
  job: BuildJob;
  artifacts: readonly BuildArtifactRef[];
}

/**
 * Runs a queued build job in-process: plan → execute steps → persist artifact descriptors.
 * Compilers are simulated — no Docker / CI / real Theme Engine calls.
 */
export class BuildExecutor {
  private readonly planner: BuildPlanner;
  private readonly now: () => string;
  private readonly hash: (input: string) => string;

  constructor(private readonly deps: BuildExecutorDeps) {
    this.planner = deps.planner ?? new BuildPlanner();
    this.now = deps.now ?? (() => new Date().toISOString());
    this.hash = deps.hash ?? defaultContentHash;
  }

  /** Execute a queued job through planning and running to a terminal status. */
  async execute(jobId: string): Promise<BuildExecutionResult> {
    const existing = await this.deps.jobs.findById(jobId);
    if (!existing) {
      throw new BuildJobNotFoundException(jobId);
    }
    if (existing.status !== 'queued') {
      throw new BuildOrchestratorException(
        `Build job '${jobId}' must be queued to execute (current: ${existing.status}).`,
      );
    }

    const plan = existing.plan ?? this.planner.plan(existing.request);
    let job: BuildJob = {
      ...existing,
      status: 'planning',
      plan,
      updatedAt: this.now(),
    };
    await this.deps.jobs.update(job);

    job = { ...job, status: 'running', updatedAt: this.now() };
    await this.deps.jobs.update(job);

    const completedStepIds: string[] = [];
    const producedArtifacts: BuildArtifactRef[] = [];

    try {
      for (const step of plan.steps) {
        const artifact = await this.runStep(job, step);
        completedStepIds.push(step.id);
        if (artifact) {
          await this.deps.artifacts.save(artifact);
          producedArtifacts.push(artifact);
        }
      }

      job = {
        ...job,
        status: 'succeeded',
        completedStepIds,
        artifactIds: producedArtifacts.map((artifact) => artifact.id),
        updatedAt: this.now(),
      };
      await this.deps.jobs.update(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      job = {
        ...job,
        status: 'failed',
        completedStepIds,
        artifactIds: producedArtifacts.map((artifact) => artifact.id),
        errorMessage: message,
        updatedAt: this.now(),
      };
      await this.deps.jobs.update(job);
      throw error;
    }

    return { job, artifacts: producedArtifacts };
  }

  private async runStep(job: BuildJob, step: BuildPlanStep): Promise<BuildArtifactRef | undefined> {
    switch (step.kind) {
      case 'resolve_config':
      case 'compile_theme':
      case 'compile_brand':
        // Simulated compile hooks — real Theme/WhiteLabel wiring lands later.
        return undefined;
      case 'emit_artifact':
        return this.createArtifact(job, step.surface, 'surface_bundle');
      default: {
        const exhaustive: never = step.kind;
        throw new BuildOrchestratorException(`Unknown plan step kind: ${String(exhaustive)}`);
      }
    }
  }

  private createArtifact(
    job: BuildJob,
    surface: BuildPlanStep['surface'],
    kind: BuildArtifactKind,
  ): BuildArtifactRef {
    const producedAt = this.now();
    const seed = [
      job.tenantId,
      String(job.request.configVersion),
      surface,
      kind,
      job.request.publishId ?? '',
    ].join(':');

    return {
      id: `${job.id}.${surface}.${kind}`,
      jobId: job.id,
      tenantId: job.tenantId,
      surface,
      kind,
      contentHash: this.hash(seed),
      configVersion: job.request.configVersion,
      producedAt,
    };
  }
}

function defaultContentHash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}
