import { BuildRequestValidationException } from '../errors.js';
import type {
  BuildPlan,
  BuildPlanStep,
  BuildPlanStepKind,
  BuildRequest,
  BuildSurface,
} from '../types.js';
import { ALL_BUILD_SURFACES } from '../types.js';

const STEP_KINDS: readonly BuildPlanStepKind[] = [
  'resolve_config',
  'compile_theme',
  'compile_brand',
  'emit_artifact',
] as const;

/**
 * Maps a BuildRequest into an ordered, surface-scoped build plan.
 * Does not execute compilers — step kinds are declarative for Task 1.
 */
export class BuildPlanner {
  plan(request: BuildRequest): BuildPlan {
    this.validate(request);

    const surfaces = this.resolveSurfaces(request.surfaces);
    const steps: BuildPlanStep[] = [];

    for (const surface of surfaces) {
      for (const kind of STEP_KINDS) {
        steps.push({
          id: `${surface}.${kind}`,
          surface,
          kind,
        });
      }
    }

    return { surfaces, steps };
  }

  private resolveSurfaces(requested: readonly BuildSurface[] | undefined): readonly BuildSurface[] {
    if (!requested || requested.length === 0) {
      return [...ALL_BUILD_SURFACES];
    }

    // Preserve canonical surface order while de-duplicating.
    const unique = new Set(requested);
    return ALL_BUILD_SURFACES.filter((surface) => unique.has(surface));
  }

  private validate(request: BuildRequest): void {
    if (!request.tenantId.trim()) {
      throw new BuildRequestValidationException('Build request tenantId cannot be empty.');
    }
    if (!Number.isInteger(request.configVersion) || request.configVersion < 1) {
      throw new BuildRequestValidationException(
        'Build request configVersion must be an integer >= 1.',
      );
    }
    if (request.surfaces) {
      for (const surface of request.surfaces) {
        if (!ALL_BUILD_SURFACES.includes(surface)) {
          throw new BuildRequestValidationException(`Unknown build surface '${String(surface)}'.`);
        }
      }
    }
  }
}
