import type { ArtifactStore } from '../domain/artifact-store.js';
import { BuildExecutor } from '../domain/build-executor.js';
import type { BuildJobRepository } from '../domain/build-job-repository.js';
import { BuildOrchestrator } from '../domain/build-orchestrator.js';
import { BuildPlanner } from '../domain/build-planner.js';
import { InMemoryArtifactStore } from './in-memory-artifact-store.js';
import { InMemoryBuildJobRepository } from './in-memory-build-job-repository.js';

export interface CreateBuildOrchestratorOptions {
  jobs?: BuildJobRepository;
  artifacts?: ArtifactStore;
  planner?: BuildPlanner;
  executor?: BuildExecutor;
  now?: () => string;
  createJobId?: () => string;
  /** Override content hashing for the default executor (tests). */
  hash?: (input: string) => string;
}

/**
 * Wire a BuildOrchestrator with in-memory defaults (or injected ports).
 */
export function createBuildOrchestrator(
  options: CreateBuildOrchestratorOptions = {},
): BuildOrchestrator {
  const jobs = options.jobs ?? new InMemoryBuildJobRepository();
  const artifacts = options.artifacts ?? new InMemoryArtifactStore();
  const planner = options.planner ?? new BuildPlanner();
  const executor =
    options.executor ??
    new BuildExecutor({
      jobs,
      artifacts,
      planner,
      now: options.now,
      hash: options.hash,
    });

  return new BuildOrchestrator({
    jobs,
    artifacts,
    planner,
    executor,
    now: options.now,
    createJobId: options.createJobId,
  });
}
