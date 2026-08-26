import type { BuildJob, BuildRequest } from '../src/types.js';

export function createTestBuildRequest(overrides: Partial<BuildRequest> = {}): BuildRequest {
  return {
    tenantId: 'tenant-fresh',
    configVersion: 3,
    reason: 'config_publish',
    ...overrides,
  };
}

export function createTestBuildJob(overrides: Partial<BuildJob> = {}): BuildJob {
  const request = overrides.request ?? createTestBuildRequest();
  const now = '2026-08-26T12:00:00.000Z';

  return {
    id: 'job-1',
    tenantId: request.tenantId,
    request,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
