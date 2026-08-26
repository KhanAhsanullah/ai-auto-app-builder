import { BuildJobAlreadyExistsException, BuildJobNotFoundException } from '../errors.js';
import { assertBuildJobTransition } from '../domain/build-job-status.js';
import type { BuildJobRepository } from '../domain/build-job-repository.js';
import type { BuildJob } from '../types.js';

/** In-memory build job store backed by Maps. */
export class InMemoryBuildJobRepository implements BuildJobRepository {
  private readonly byId = new Map<string, BuildJob>();
  private readonly byTenant = new Map<string, Set<string>>();

  async save(job: BuildJob): Promise<void> {
    if (this.byId.has(job.id)) {
      throw new BuildJobAlreadyExistsException(job.id);
    }

    this.byId.set(job.id, structuredClone(job));
    const tenantJobs = this.byTenant.get(job.tenantId) ?? new Set<string>();
    tenantJobs.add(job.id);
    this.byTenant.set(job.tenantId, tenantJobs);
  }

  async update(job: BuildJob): Promise<void> {
    const existing = this.byId.get(job.id);
    if (!existing) {
      throw new BuildJobNotFoundException(job.id);
    }

    if (existing.tenantId !== job.tenantId) {
      throw new BuildJobNotFoundException(job.id);
    }

    assertBuildJobTransition(job.id, existing.status, job.status);

    this.byId.set(job.id, structuredClone(job));
  }

  async findById(jobId: string): Promise<BuildJob | undefined> {
    const job = this.byId.get(jobId);
    return job ? structuredClone(job) : undefined;
  }

  async findByTenantId(tenantId: string): Promise<BuildJob[]> {
    const ids = this.byTenant.get(tenantId);
    if (!ids) {
      return [];
    }

    return [...ids]
      .map((id) => this.byId.get(id))
      .filter((job): job is BuildJob => job !== undefined)
      .map((job) => structuredClone(job));
  }
}
