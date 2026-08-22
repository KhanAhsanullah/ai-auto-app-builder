import type { AuthMethodId, AuthSurface, ResolvedAuthPolicy } from '../types.js';
import type { AuthProvider } from '../domain/auth-provider.js';

/** Minimal stub provider for unit tests and Task 1 wiring demos. */
export class StubAuthProvider implements AuthProvider {
  constructor(
    readonly id: AuthMethodId,
    readonly surfaces: readonly AuthSurface[],
  ) {}

  supports(policy: ResolvedAuthPolicy): boolean {
    return this.surfaces.includes(policy.surface) && policy.enabledMethods.includes(this.id);
  }
}
