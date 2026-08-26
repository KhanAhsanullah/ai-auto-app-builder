import type { BuildArtifactRef } from './build-artifact.js';

/** Persistence port for build artifact descriptors. */
export interface ArtifactStore {
  save(artifact: BuildArtifactRef): Promise<void>;
  findById(artifactId: string): Promise<BuildArtifactRef | undefined>;
  findByJobId(jobId: string): Promise<BuildArtifactRef[]>;
  findByTenantId(tenantId: string): Promise<BuildArtifactRef[]>;
}
