import { AuthMethodNotEnabledException } from '../errors.js';
import type { AuthMethodId, ResolvedAuthPolicy } from '../types.js';
import type { AuthProvider } from './auth-provider.js';

/**
 * In-memory registry of auth provider ports for a process.
 * Task 1: registration + lookup against resolved policy; no network I/O.
 */
export class AuthProviderRegistry {
  private readonly providers = new Map<string, AuthProvider>();

  /** Register a provider port. Replaces an existing provider with the same id. */
  register(provider: AuthProvider): void {
    this.providers.set(provider.id, provider);
  }

  /** Unregister a provider by method id. */
  unregister(id: AuthMethodId): boolean {
    return this.providers.delete(id);
  }

  /** List registered provider ids. */
  list(): string[] {
    return [...this.providers.keys()].sort((a, b) => a.localeCompare(b));
  }

  /**
   * Resolve providers that are both registered and enabled on the policy.
   * Throws when an explicitly requested method is not enabled.
   */
  resolveForPolicy(policy: ResolvedAuthPolicy, requestedMethod?: AuthMethodId): AuthProvider[] {
    if (requestedMethod !== undefined) {
      if (!policy.enabledMethods.includes(requestedMethod)) {
        throw new AuthMethodNotEnabledException(policy.surface, requestedMethod);
      }
      const provider = this.providers.get(requestedMethod);
      if (!provider || !provider.supports(policy)) {
        return [];
      }
      return [provider];
    }

    return policy.enabledMethods
      .map((method) => this.providers.get(method))
      .filter((provider): provider is AuthProvider => {
        return provider !== undefined && provider.supports(policy);
      });
  }
}
