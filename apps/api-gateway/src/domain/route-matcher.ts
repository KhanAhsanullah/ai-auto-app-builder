import { RouteNotFoundException } from '../errors.js';
import type { GatewayRoute, HttpMethod, MatchedRoute } from '../types.js';

interface CompiledRoute {
  route: GatewayRoute;
  regex: RegExp;
  paramNames: string[];
}

/** In-memory route table with `:param` path matching. */
export class RouteMatcher {
  private readonly compiled: CompiledRoute[] = [];

  /** Register a route definition. */
  register(route: GatewayRoute): void {
    this.compiled.push(compileRoute(route));
  }

  /** Register many routes. */
  registerAll(routes: readonly GatewayRoute[]): void {
    for (const route of routes) {
      this.register(route);
    }
  }

  /** List registered routes. */
  list(): GatewayRoute[] {
    return this.compiled.map((entry) => entry.route);
  }

  /** Match a method + path or throw RouteNotFoundException. */
  match(method: string, path: string): MatchedRoute {
    const normalizedMethod = method.toUpperCase() as HttpMethod;
    const normalizedPath = normalizePath(path);

    for (const entry of this.compiled) {
      if (entry.route.method !== normalizedMethod) {
        continue;
      }
      const matched = entry.regex.exec(normalizedPath);
      if (!matched) {
        continue;
      }

      const params: Record<string, string> = {};
      entry.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(matched[index + 1] ?? '');
      });

      return { route: entry.route, params };
    }

    throw new RouteNotFoundException(normalizedMethod, normalizedPath);
  }
}

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/';
  }
  const withoutQuery = path.split('?')[0] ?? path;
  const trimmed = withoutQuery.replace(/\/+$/u, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function compileRoute(route: GatewayRoute): CompiledRoute {
  const paramNames: string[] = [];
  const normalized = normalizePath(route.path);
  const pattern = normalized
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return escapeRegex(segment);
    })
    .join('/');

  return {
    route: { ...route, path: normalized },
    regex: new RegExp(`^${pattern}$`, 'u'),
    paramNames,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
