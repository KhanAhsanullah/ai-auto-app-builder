import type { BuildJobStatus } from './types.js';

/** Base error for build orchestrator failures. */
export class BuildOrchestratorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BuildOrchestratorException';
  }
}

/** Thrown when a build job status transition is not allowed. */
export class InvalidBuildJobTransitionException extends BuildOrchestratorException {
  readonly jobId: string;
  readonly fromStatus: BuildJobStatus;
  readonly toStatus: BuildJobStatus;

  constructor(jobId: string, fromStatus: BuildJobStatus, toStatus: BuildJobStatus) {
    super(`Invalid build job transition for '${jobId}': ${fromStatus} -> ${toStatus}.`);
    this.name = 'InvalidBuildJobTransitionException';
    this.jobId = jobId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

/** Thrown when a build job cannot be found. */
export class BuildJobNotFoundException extends BuildOrchestratorException {
  readonly jobId: string;

  constructor(jobId: string) {
    super(`Build job not found with id '${jobId}'.`);
    this.name = 'BuildJobNotFoundException';
    this.jobId = jobId;
  }
}

/** Thrown when a build job already exists. */
export class BuildJobAlreadyExistsException extends BuildOrchestratorException {
  readonly jobId: string;

  constructor(jobId: string) {
    super(`Build job already exists with id '${jobId}'.`);
    this.name = 'BuildJobAlreadyExistsException';
    this.jobId = jobId;
  }
}

/** Thrown when a build request fails validation. */
export class BuildRequestValidationException extends BuildOrchestratorException {
  constructor(message: string) {
    super(message);
    this.name = 'BuildRequestValidationException';
  }
}
