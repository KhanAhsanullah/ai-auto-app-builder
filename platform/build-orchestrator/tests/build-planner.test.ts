import { describe, expect, it } from 'vitest';

import { BuildPlanner } from '../src/domain/build-planner.js';
import { BuildRequestValidationException } from '../src/errors.js';
import { ALL_BUILD_SURFACES } from '../src/types.js';
import { createTestBuildRequest } from './helpers.js';

describe('BuildPlanner', () => {
  const planner = new BuildPlanner();

  it('plans all four surfaces with four steps each by default', () => {
    const plan = planner.plan(createTestBuildRequest());

    expect(plan.surfaces).toEqual([...ALL_BUILD_SURFACES]);
    expect(plan.steps).toHaveLength(16);
    expect(plan.steps[0]).toEqual({
      id: 'admin.resolve_config',
      surface: 'admin',
      kind: 'resolve_config',
    });
    expect(plan.steps.at(-1)?.id).toBe('api.emit_artifact');
  });

  it('plans a subset of surfaces in canonical order', () => {
    const plan = planner.plan(createTestBuildRequest({ surfaces: ['mobile', 'web', 'web'] }));

    expect(plan.surfaces).toEqual(['web', 'mobile']);
    expect(plan.steps.map((step) => step.surface)).toEqual([
      'web',
      'web',
      'web',
      'web',
      'mobile',
      'mobile',
      'mobile',
      'mobile',
    ]);
  });

  it('rejects invalid tenantId and configVersion', () => {
    expect(() => planner.plan(createTestBuildRequest({ tenantId: '  ' }))).toThrow(
      BuildRequestValidationException,
    );
    expect(() => planner.plan(createTestBuildRequest({ configVersion: 0 }))).toThrow(
      BuildRequestValidationException,
    );
  });
});
