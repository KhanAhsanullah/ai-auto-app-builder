import type { BuildSurface } from '../types.js';

/** Artifact kinds produced by simulated compile/emit steps. */
export type BuildArtifactKind = 'theme' | 'brand' | 'surface_bundle';

/** Metadata descriptor for a produced build artifact (no binary payload in Task 2). */
export interface BuildArtifactRef {
  id: string;
  jobId: string;
  tenantId: string;
  surface: BuildSurface;
  kind: BuildArtifactKind;
  /** Deterministic content hash for the simulated artifact. */
  contentHash: string;
  configVersion: number;
  producedAt: string;
}
