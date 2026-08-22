export { AuthPolicyResolver } from './domain/auth-policy-resolver.js';
export type { AuthPolicyResolverDeps } from './domain/auth-policy-resolver.js';
export { AuthPolicyValidator } from './domain/auth-policy-validator.js';
export { AuthProviderRegistry } from './domain/auth-provider-registry.js';
export type { AuthChallengePort, AuthProvider, TokenStore } from './domain/auth-provider.js';
export {
  authConfigSourceFromProviderResult,
  toResolveAuthPolicyInput,
} from './domain/map-config-auth-source.js';
export type { ConfigProviderAuthInput } from './domain/map-config-auth-source.js';
export {
  AuthClientException,
  AuthMethodNotEnabledException,
  AuthPolicyResolutionException,
  AuthPolicyValidationException,
} from './errors.js';
export { InMemoryTokenStore } from './infrastructure/in-memory-token-store.js';
export { StubAuthProvider } from './infrastructure/stub-auth-provider.js';
export type {
  AdminRoleId,
  AuthConfigSource,
  AuthMethodId,
  AuthSurface,
  MfaMethodId,
  ResolveAuthPolicyInput,
  ResolvedApiAuthPolicy,
  ResolvedAuthPolicy,
  ResolvedMfaPolicy,
  ResolvedSessionPolicy,
  ResolvedSsoPolicy,
  SsoProviderId,
} from './types.js';
export type { Authentication } from '@ai-commerce/config-schema';
