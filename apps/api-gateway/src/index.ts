export { ConfigInjector } from './domain/config-injector.js';
export type { ConfigInjectorOptions, TenantConfigLoader } from './domain/config-injector.js';
export { createCoreMiddlewares, createGatewayPipeline } from './domain/create-gateway-pipeline.js';
export type {
  CreateCoreMiddlewaresOptions,
  GatewayPipelineOptions,
} from './domain/create-gateway-pipeline.js';
export {
  composeGatewayPipeline,
  type GatewayMiddleware,
  type GatewayNext,
} from './domain/middleware-pipeline.js';
export { InMemoryRateLimiter, type RateLimiter } from './domain/rate-limiter.js';
export { RouteMatcher } from './domain/route-matcher.js';
export { TenantResolver } from './domain/tenant-resolver.js';
export type { TenantDirectory, TenantResolverOptions } from './domain/tenant-resolver.js';
export {
  ApiGatewayException,
  ConfigInjectionException,
  RateLimitExceededException,
  RouteNotFoundException,
  TenantResolutionException,
} from './errors.js';
export { InMemoryTenantConfigLoader } from './infrastructure/in-memory-tenant-config-loader.js';
export { InMemoryTenantDirectory } from './infrastructure/in-memory-tenant-directory.js';
export type {
  GatewayContext,
  GatewayRequest,
  GatewayResponse,
  GatewayRoute,
  HttpMethod,
  MatchedRoute,
  RateLimitDecision,
  ResolvedTenantIdentity,
} from './types.js';
