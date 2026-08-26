import type { BuildJob } from '../types.js';

/** Persistence port for build jobs. */
export interface BuildJobRepository {
  save(job: BuildJob): Promise<void>;
  update(job: BuildJob): Promise<void>;
  findById(jobId: string): Promise<BuildJob | undefined>;
  findByTenantId(tenantId: string): Promise<BuildJob[]>;
}
