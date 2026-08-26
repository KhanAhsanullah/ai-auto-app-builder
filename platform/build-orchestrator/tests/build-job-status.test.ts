import { describe, expect, it } from 'vitest';

import {
  assertBuildJobTransition,
  canTransitionBuildJobStatus,
  isTerminalBuildJobStatus,
} from '../src/domain/build-job-status.js';
import { InvalidBuildJobTransitionException } from '../src/errors.js';

describe('build job status machine', () => {
  it('allows the happy path queued → planning → running → succeeded', () => {
    expect(canTransitionBuildJobStatus('queued', 'planning')).toBe(true);
    expect(canTransitionBuildJobStatus('planning', 'running')).toBe(true);
    expect(canTransitionBuildJobStatus('running', 'succeeded')).toBe(true);
  });

  it('allows failure and cancellation from active states', () => {
    expect(canTransitionBuildJobStatus('planning', 'failed')).toBe(true);
    expect(canTransitionBuildJobStatus('running', 'failed')).toBe(true);
    expect(canTransitionBuildJobStatus('queued', 'cancelled')).toBe(true);
    expect(canTransitionBuildJobStatus('running', 'cancelled')).toBe(true);
  });

  it('rejects illegal transitions and terminal hops', () => {
    expect(canTransitionBuildJobStatus('queued', 'succeeded')).toBe(false);
    expect(canTransitionBuildJobStatus('succeeded', 'running')).toBe(false);
    expect(() => assertBuildJobTransition('job-1', 'failed', 'queued')).toThrow(
      InvalidBuildJobTransitionException,
    );
  });

  it('treats same-status as a no-op', () => {
    expect(() => assertBuildJobTransition('job-1', 'running', 'running')).not.toThrow();
  });

  it('identifies terminal statuses', () => {
    expect(isTerminalBuildJobStatus('succeeded')).toBe(true);
    expect(isTerminalBuildJobStatus('failed')).toBe(true);
    expect(isTerminalBuildJobStatus('cancelled')).toBe(true);
    expect(isTerminalBuildJobStatus('running')).toBe(false);
  });
});
