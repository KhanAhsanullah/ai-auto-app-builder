/** Deployable surfaces rebuilt from published tenant config. */
export type BuildSurface = 'admin' | 'web' | 'mobile' | 'api';

/** Why a build job was created. */
export type BuildReason = 'config_publish' | 'manual' | 'retry';

/** Lifecycle status of a build job. */
export type BuildJobStatus =
  'queued' | 'planning' | 'running' | 'succeeded' | 'failed' | 'cancelled';

/** Named plan step kinds (no real compilers in Task 1). */
export type BuildPlanStepKind =
  'resolve_config' | 'compile_theme' | 'compile_brand' | 'emit_artifact';

/** Request to rebuild one or more surfaces for a tenant. */
export interface BuildRequest {
  tenantId: string;
  /** Published tenant config revision. */
  configVersion: number;
  /** Optional Config Engine publish event id. */
  publishId?: string;
  /** Surfaces to rebuild (defaults to all four). */
  surfaces?: readonly BuildSurface[];
  reason?: BuildReason;
}

/** A single ordered step in a build plan. */
export interface BuildPlanStep {
  id: string;
  surface: BuildSurface;
  kind: BuildPlanStepKind;
}

/** Ordered plan produced by BuildPlanner. */
export interface BuildPlan {
  surfaces: readonly BuildSurface[];
  steps: readonly BuildPlanStep[];
}

/** Persisted build job record. */
export interface BuildJob {
  id: string;
  tenantId: string;
  request: BuildRequest;
  status: BuildJobStatus;
  plan?: BuildPlan;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/** Default surfaces rebuilt on a full config publish. */
export const ALL_BUILD_SURFACES: readonly BuildSurface[] = [
  'admin',
  'web',
  'mobile',
  'api',
] as const;
