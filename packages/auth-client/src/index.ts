export { AuthClient } from './domain/auth-client.js';
export type { AuthClientDeps } from './domain/auth-client.js';
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
export { MagicLinkProvider } from './domain/magic-link-provider.js';
export type { MagicLinkProviderOptions } from './domain/magic-link-provider.js';
export { OAuthPkceProvider } from './domain/oauth-pkce-provider.js';
export type { OAuthPkceProviderOptions } from './domain/oauth-pkce-provider.js';
export {
  base64UrlEncode,
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from './domain/pkce.js';
export { SsoChallengeProvider } from './domain/sso-challenge-provider.js';
export type { SsoChallengeProviderOptions } from './domain/sso-challenge-provider.js';
export {
  listEnabledMethodsBySurface,
  resolveAllSurfacePolicies,
  sessionStorageKey,
} from './domain/surface-auth-helpers.js';
export type { MultiSurfaceAuthPolicies } from './domain/surface-auth-helpers.js';
export { TokenRefreshService } from './domain/token-refresh-service.js';
export type { TokenRefreshServiceOptions } from './domain/token-refresh-service.js';
export type {
  AuthChallengeStartResult,
  AuthTokenSet,
  MagicLinkChallengeRecord,
  OAuthClientConfig,
  PkceChallengeRecord,
  SsoChallengeRecord,
} from './domain/auth-flow-types.js';
export type { HttpJsonClient, MagicLinkDeliveryPort, SyncKeyValueStore } from './domain/ports.js';
export {
  AuthChallengeException,
  AuthClientException,
  AuthMethodNotEnabledException,
  AuthPolicyResolutionException,
  AuthPolicyValidationException,
  AuthProviderNotConfiguredException,
  AuthTokenException,
} from './errors.js';
export { createAuthClient } from './infrastructure/create-auth-client.js';
export type {
  CreateAuthClientOptions,
  SocialOAuthMethod,
} from './infrastructure/create-auth-client.js';
export { InMemoryPkceChallengeStore } from './infrastructure/in-memory-pkce-challenge-store.js';
export { InMemoryTokenStore } from './infrastructure/in-memory-token-store.js';
export {
  InMemoryKeyValueStore,
  PrefixedSecureTokenStore,
} from './infrastructure/prefixed-secure-token-store.js';
export { ScriptedHttpJsonClient } from './infrastructure/scripted-http-json-client.js';
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
