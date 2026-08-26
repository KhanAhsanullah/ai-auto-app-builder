import { InvalidBuildJobTransitionException } from '../errors.js';
import type { BuildJobStatus } from '../types.js';

/** Allowed status transitions for build jobs. */
const ALLOWED_TRANSITIONS: Readonly<Record<BuildJobStatus, readonly BuildJobStatus[]>> = {
  queued: ['planning', 'cancelled'],
  planning: ['running', 'failed', 'cancelled'],
  running: ['succeeded', 'failed', 'cancelled'],
  succeeded: [],
  failed: [],
  cancelled: [],
};

/** Whether a status transition is allowed. */
export function canTransitionBuildJobStatus(from: BuildJobStatus, to: BuildJobStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Assert a status transition is legal; throw otherwise.
 */
export function assertBuildJobTransition(
  jobId: string,
  from: BuildJobStatus,
  to: BuildJobStatus,
): void {
  if (from === to) {
    return;
  }
  if (!canTransitionBuildJobStatus(from, to)) {
    throw new InvalidBuildJobTransitionException(jobId, from, to);
  }
}

/** Terminal statuses that cannot transition further. */
export function isTerminalBuildJobStatus(status: BuildJobStatus): boolean {
  return status === 'succeeded' || status === 'failed' || status === 'cancelled';
}
