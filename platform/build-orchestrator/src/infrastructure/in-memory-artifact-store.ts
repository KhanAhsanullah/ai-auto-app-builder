import type { ArtifactStore } from '../domain/artifact-store.js';
import type { BuildArtifactRef } from '../domain/build-artifact.js';
import { BuildOrchestratorException } from '../errors.js';

/** In-memory artifact descriptor store. */
export class InMemoryArtifactStore implements ArtifactStore {
  private readonly byId = new Map<string, BuildArtifactRef>();
  private readonly byJob = new Map<string, Set<string>>();
  private readonly byTenant = new Map<string, Set<string>>();

  async save(artifact: BuildArtifactRef): Promise<void> {
    if (this.byId.has(artifact.id)) {
      throw new BuildOrchestratorException(
        `Build artifact already exists with id '${artifact.id}'.`,
      );
    }

    this.byId.set(artifact.id, structuredClone(artifact));

    const jobSet = this.byJob.get(artifact.jobId) ?? new Set<string>();
    jobSet.add(artifact.id);
    this.byJob.set(artifact.jobId, jobSet);

    const tenantSet = this.byTenant.get(artifact.tenantId) ?? new Set<string>();
    tenantSet.add(artifact.id);
    this.byTenant.set(artifact.tenantId, tenantSet);
  }

  async findById(artifactId: string): Promise<BuildArtifactRef | undefined> {
    const artifact = this.byId.get(artifactId);
    return artifact ? structuredClone(artifact) : undefined;
  }

  async findByJobId(jobId: string): Promise<BuildArtifactRef[]> {
    return this.collect(this.byJob.get(jobId));
  }

  async findByTenantId(tenantId: string): Promise<BuildArtifactRef[]> {
    return this.collect(this.byTenant.get(tenantId));
  }

  private collect(ids: Set<string> | undefined): BuildArtifactRef[] {
    if (!ids) {
      return [];
    }
    return [...ids]
      .map((id) => this.byId.get(id))
      .filter((artifact): artifact is BuildArtifactRef => artifact !== undefined)
      .map((artifact) => structuredClone(artifact));
  }
}
