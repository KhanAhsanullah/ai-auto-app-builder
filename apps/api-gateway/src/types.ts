import type { ConfigProviderResult } from '@ai-commerce/config-runtime';

/** HTTP methods supported by the gateway route table. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** Framework-agnostic inbound gateway request. */
export interface GatewayRequest {
  method: HttpMethod | string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  /** Optional client IP for rate limiting. */
  clientIp?: string;
}

/** Framework-agnostic outbound gateway response. */
export interface GatewayResponse {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
}

/** Resolved tenant identity attached to a request. */
export interface ResolvedTenantIdentity {
  id: string;
  slug: string;
}

/** Route definition registered in the gateway route table. */
export interface GatewayRoute {
  method: HttpMethod;
  /** Path pattern with optional `:param` segments (e.g. `/v1/catalog/:id`). */
  path: string;
  name?: string;
  /** When false, skip tenant resolution (health checks, public well-known). Default true. */
  requireTenant?: boolean;
  /** Requests per window for this route (overrides default limiter). */
  rateLimitPerWindow?: number;
}

/** Matched route plus extracted path params. */
export interface MatchedRoute {
  route: GatewayRoute;
  params: Record<string, string>;
}

/** Per-request gateway context built by the middleware pipeline. */
export interface GatewayContext {
  request: GatewayRequest;
  tenant?: ResolvedTenantIdentity;
  route?: MatchedRoute;
  /** Resolved tenant configuration from Config Runtime (when injected). */
  config?: ConfigProviderResult;
  /** Mutable bag for middleware-shared state. */
  state: Record<string, unknown>;
}

/** Result of a rate-limit check. */
export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}
