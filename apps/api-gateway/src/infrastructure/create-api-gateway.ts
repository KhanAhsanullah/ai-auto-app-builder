import type { ConfigProvider } from '@ai-commerce/config-runtime';
import { ConfigProvider as DefaultConfigProvider } from '@ai-commerce/config-runtime';

import { ApiGateway } from '../domain/api-gateway.js';
import type { CreateAuthMiddlewareOptions } from '../domain/auth-middleware.js';
import { ConfigInjector, type TenantConfigLoader } from '../domain/config-injector.js';
import {
  createGatewayPipeline,
  type GatewayPipelineOptions,
} from '../domain/create-gateway-pipeline.js';
import type { GatewayMiddleware } from '../domain/middleware-pipeline.js';
import { InMemoryRateLimiter, type RateLimiter } from '../domain/rate-limiter.js';
import { RouteMatcher } from '../domain/route-matcher.js';
import {
  TenantResolver,
  type TenantDirectory,
  type TenantResolverOptions,
} from '../domain/tenant-resolver.js';
import type { GatewayContext, GatewayResponse, GatewayRoute } from '../types.js';
import { createNodeHttpServer, type NodeHttpAdapterOptions } from './node-http-adapter.js';

export interface CreateApiGatewayOptions {
  /** Tenant identity directory (required). */
  directory: TenantDirectory;
  /** Loads tenant-layer config for Config Runtime injection (required). */
  configLoader: TenantConfigLoader;
  /** Route table definitions (used when `routeMatcher` is not provided). */
  routes?: readonly GatewayRoute[];
  /** Pre-built route matcher (overrides `routes`). */
  routeMatcher?: RouteMatcher;
  /** Terminal request handler after middleware. */
  handler: (context: GatewayContext) => Promise<GatewayResponse>;
  /** Optional auth middleware wiring. */
  auth?: CreateAuthMiddlewareOptions;
  /** Extra middleware after core (+ auth). */
  extraMiddlewares?: GatewayMiddleware[];
  /** Override ConfigProvider (default: uncached ConfigProvider). */
  configProvider?: ConfigProvider;
  /** Override ConfigInjector. */
  configInjector?: ConfigInjector;
  /** Override TenantResolver. */
  tenantResolver?: TenantResolver;
  /** Options merged when constructing the default TenantResolver. */
  tenantResolverOptions?: Omit<TenantResolverOptions, 'directory'>;
  /** Override rate limiter (default: InMemoryRateLimiter). */
  rateLimiter?: RateLimiter;
  defaultRateLimit?: number;
  rateLimitWindowMs?: number;
  /** Default Node HTTP adapter options for `createHttpServer` / `listen`. */
  httpAdapter?: NodeHttpAdapterOptions;
}

/**
 * Wire defaults and return the ApiGateway facade (pipeline + Node HTTP binding).
 */
export function createApiGateway(options: CreateApiGatewayOptions): ApiGateway {
  const routeMatcher = options.routeMatcher ?? new RouteMatcher();
  if (!options.routeMatcher && options.routes) {
    routeMatcher.registerAll(options.routes);
  }

  const tenantResolver =
    options.tenantResolver ??
    new TenantResolver({
      directory: options.directory,
      ...options.tenantResolverOptions,
    });

  const configProvider = options.configProvider ?? new DefaultConfigProvider({ cache: false });
  const configInjector =
    options.configInjector ??
    new ConfigInjector({
      configProvider,
      configLoader: options.configLoader,
    });

  const rateLimiter = options.rateLimiter ?? new InMemoryRateLimiter();

  const pipelineOptions: GatewayPipelineOptions = {
    routeMatcher,
    tenantResolver,
    configInjector,
    rateLimiter,
    defaultRateLimit: options.defaultRateLimit,
    rateLimitWindowMs: options.rateLimitWindowMs,
    auth: options.auth,
    extraMiddlewares: options.extraMiddlewares,
    handler: options.handler,
  };

  const handle = createGatewayPipeline(pipelineOptions);

  return new ApiGateway({
    handle,
    routeMatcher,
    createHttpServer: (adapterOptions) =>
      createNodeHttpServer(handle, {
        ...options.httpAdapter,
        ...adapterOptions,
      }),
  });
}
