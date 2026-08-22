import {
  AuthUnauthorizedException,
  ConfigInjectionException,
  RateLimitExceededException,
  RouteNotFoundException,
  TenantResolutionException,
} from '../errors.js';
import type { GatewayContext, GatewayRequest, GatewayResponse } from '../types.js';
import { createAuthMiddleware, type CreateAuthMiddlewareOptions } from './auth-middleware.js';
import type { ConfigInjector } from './config-injector.js';
import { composeGatewayPipeline, type GatewayMiddleware } from './middleware-pipeline.js';
import type { RateLimiter } from './rate-limiter.js';
import type { RouteMatcher } from './route-matcher.js';
import type { TenantResolver } from './tenant-resolver.js';

export interface CreateCoreMiddlewaresOptions {
  routeMatcher: RouteMatcher;
  tenantResolver: TenantResolver;
  configInjector: ConfigInjector;
  rateLimiter: RateLimiter;
  /** Default requests per window when route does not override. */
  defaultRateLimit?: number;
  /** Fixed window size in milliseconds. */
  rateLimitWindowMs?: number;
}

/** Build the Sprint 7 Task 1 core middleware stack (route → tenant → rate limit → config). */
export function createCoreMiddlewares(options: CreateCoreMiddlewaresOptions): GatewayMiddleware[] {
  const defaultRateLimit = options.defaultRateLimit ?? 100;
  const rateLimitWindowMs = options.rateLimitWindowMs ?? 60_000;

  const matchRoute: GatewayMiddleware = async (context, next) => {
    const matched = options.routeMatcher.match(context.request.method, context.request.path);
    context.route = matched;
    context.state.params = matched.params;
    return next();
  };

  const resolveTenant: GatewayMiddleware = async (context, next) => {
    const requireTenant = context.route?.route.requireTenant !== false;
    if (!requireTenant) {
      return next();
    }

    const tenant = await options.tenantResolver.resolve(context.request.headers);
    if (!tenant) {
      throw new TenantResolutionException(
        `Unable to resolve tenant for ${context.request.method} ${context.request.path}.`,
      );
    }
    context.tenant = tenant;
    return next();
  };

  const rateLimit: GatewayMiddleware = async (context, next) => {
    const limit = context.route?.route.rateLimitPerWindow ?? defaultRateLimit;
    const tenantKey = context.tenant?.id ?? 'public';
    const routeKey = context.route?.route.name ?? context.request.path;
    const clientKey = context.request.clientIp ?? 'unknown';
    const key = `${tenantKey}:${routeKey}:${clientKey}`;

    const decision = await options.rateLimiter.consume({
      key,
      limit,
      windowMs: rateLimitWindowMs,
    });

    context.state.rateLimit = decision;

    if (!decision.allowed) {
      throw new RateLimitExceededException(Math.max(0, decision.resetAt - Date.now()));
    }

    return next();
  };

  const injectConfig: GatewayMiddleware = async (context, next) => {
    if (context.route?.route.requireTenant === false || !context.tenant) {
      return next();
    }
    const withConfig = await options.configInjector.inject(context);
    context.config = withConfig.config;
    return next();
  };

  return [matchRoute, resolveTenant, rateLimit, injectConfig];
}

export interface GatewayPipelineOptions extends CreateCoreMiddlewaresOptions {
  /**
   * Auth middleware wiring (Sprint 7 Task 2).
   * When set, runs after config injection for routes with `requireAuth: true`.
   */
  auth?: CreateAuthMiddlewareOptions;
  /** Additional middleware after the core stack (and auth, when configured). */
  extraMiddlewares?: GatewayMiddleware[];
  /** Terminal handler after middleware. */
  handler: (context: GatewayContext) => Promise<GatewayResponse>;
}

/** Create a runnable gateway pipeline from core + optional auth + extra middleware. */
export function createGatewayPipeline(
  options: GatewayPipelineOptions,
): (request: GatewayRequest) => Promise<GatewayResponse> {
  const middlewares = [
    ...createCoreMiddlewares(options),
    ...(options.auth ? [createAuthMiddleware(options.auth)] : []),
    ...(options.extraMiddlewares ?? []),
  ];

  const run = composeGatewayPipeline(middlewares, options.handler);

  return async (request: GatewayRequest): Promise<GatewayResponse> => {
    const context: GatewayContext = {
      request: {
        ...request,
        method: request.method.toUpperCase(),
        headers: normalizeHeaders(request.headers),
      },
      state: {},
    };

    try {
      return await run(context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

function normalizeHeaders(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string | string[] | undefined> {
  const normalized: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

function toErrorResponse(error: unknown): GatewayResponse {
  if (error instanceof TenantResolutionException) {
    return { status: 400, body: { error: 'tenant_resolution_failed', message: error.message } };
  }
  if (error instanceof RouteNotFoundException) {
    return { status: 404, body: { error: 'route_not_found', message: error.message } };
  }
  if (error instanceof RateLimitExceededException) {
    return {
      status: 429,
      headers: { 'retry-after': String(Math.ceil(error.retryAfterMs / 1000)) },
      body: { error: 'rate_limit_exceeded', message: error.message },
    };
  }
  if (error instanceof ConfigInjectionException) {
    return { status: 502, body: { error: 'config_injection_failed', message: error.message } };
  }
  if (error instanceof AuthUnauthorizedException) {
    return {
      status: 401,
      headers: { 'www-authenticate': 'Bearer' },
      body: { error: 'unauthorized', message: error.message },
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return { status: 500, body: { error: 'internal_error', message } };
}
