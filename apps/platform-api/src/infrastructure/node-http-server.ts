import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import type { PlatformApi } from '../domain/platform-api.js';
import { parseBoomLaunchBody } from '../domain/map-boom-launch.js';
import {
  parseCatalogProductCreateBody,
  parseCatalogProductPatchBody,
} from '../domain/map-catalog-product.js';
import { PlatformApiException } from '../errors.js';
import type {
  BoomLaunchHttpBody,
  CatalogProductCreateHttpBody,
  CatalogProductPatchHttpBody,
  PlatformApiListenResult,
} from '../types.js';

export interface CreatePlatformHttpServerOptions {
  api: PlatformApi;
}

const CORS_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS';

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', CORS_METHODS);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Length', Buffer.byteLength(payload));
  res.end(payload);
}

function sendCorsNoContent(res: ServerResponse): void {
  res.statusCode = 204;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', CORS_METHODS);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.end();
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new PlatformApiException('Request body must be valid JSON.', 400);
  }
}

function matchTenantCatalogCollection(pathname: string): string | undefined {
  const match = /^\/v1\/tenants\/([^/]+)\/catalog\/products\/?$/.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function matchTenantCatalogProduct(
  pathname: string,
): { tenantId: string; productId: string } | undefined {
  const match = /^\/v1\/tenants\/([^/]+)\/catalog\/products\/([^/]+)\/?$/.exec(pathname);
  if (!match?.[1] || !match[2]) {
    return undefined;
  }
  return {
    tenantId: decodeURIComponent(match[1]),
    productId: decodeURIComponent(match[2]),
  };
}

function matchTenantConfigGet(pathname: string): string | undefined {
  const match = /^\/v1\/tenants\/([^/]+)\/config\/?$/.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function matchTenantGet(pathname: string): string | undefined {
  const match = /^\/v1\/tenants\/([^/]+)\/?$/.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/** Node HTTP adapter for PlatformApi (health + Boom launch + tenant reads). */
export function createPlatformHttpServer(options: CreatePlatformHttpServerOptions): Server {
  const { api } = options;

  return createServer((req, res) => {
    void handleRequest(api, req, res);
  });
}

async function handleRequest(
  api: PlatformApi,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const method = (req.method ?? 'GET').toUpperCase();
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    if (method === 'OPTIONS') {
      sendCorsNoContent(res);
      return;
    }

    if (method === 'GET' && (pathname === '/health' || pathname === '/v1/health')) {
      sendJson(res, 200, api.health());
      return;
    }

    if (method === 'POST' && pathname === '/v1/boom/launch') {
      const body = (await readJsonBody(req)) as BoomLaunchHttpBody;
      const input = parseBoomLaunchBody(body);
      const result = await api.launchBoom(input);
      sendJson(res, result.created ? 201 : 200, result);
      return;
    }

    if (method === 'GET' && pathname === '/v1/tenants') {
      const listed = await api.listTenants();
      sendJson(res, 200, listed);
      return;
    }

    const catalogProduct = matchTenantCatalogProduct(pathname);
    if (catalogProduct) {
      if (method === 'PATCH') {
        const body = (await readJsonBody(req)) as CatalogProductPatchHttpBody;
        const input = parseCatalogProductPatchBody(body);
        const product = await api.updateCatalogProduct(
          catalogProduct.tenantId,
          catalogProduct.productId,
          input,
        );
        sendJson(res, 200, { product });
        return;
      }
      if (method === 'DELETE') {
        await api.deleteCatalogProduct(catalogProduct.tenantId, catalogProduct.productId);
        sendJson(res, 200, { deleted: true, productId: catalogProduct.productId });
        return;
      }
    }

    const catalogTenantId = matchTenantCatalogCollection(pathname);
    if (catalogTenantId) {
      if (method === 'GET') {
        const catalog = await api.getTenantCatalog(catalogTenantId);
        sendJson(res, 200, catalog);
        return;
      }
      if (method === 'POST') {
        const body = (await readJsonBody(req)) as CatalogProductCreateHttpBody;
        const input = parseCatalogProductCreateBody(body);
        const product = await api.createCatalogProduct(catalogTenantId, input);
        sendJson(res, 201, { product });
        return;
      }
    }

    const configTenantId = matchTenantConfigGet(pathname);
    if (method === 'GET' && configTenantId) {
      const config = await api.getTenantConfig(configTenantId);
      sendJson(res, 200, config);
      return;
    }

    const tenantId = matchTenantGet(pathname);
    if (method === 'GET' && tenantId) {
      const tenant = await api.getTenant(tenantId);
      sendJson(res, 200, tenant);
      return;
    }

    sendJson(res, 404, { error: 'Not found', path: pathname });
  } catch (err: unknown) {
    if (err instanceof PlatformApiException) {
      sendJson(res, err.statusCode, { error: err.message, name: err.name });
      return;
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    sendJson(res, 500, { error: message });
  }
}

/** Bind the platform HTTP server and resolve when listening. */
export async function listenPlatformApi(
  api: PlatformApi,
  port = 0,
  host = '127.0.0.1',
): Promise<PlatformApiListenResult> {
  const server = createPlatformHttpServer({ api });

  await new Promise<void>((resolve, reject) => {
    const onError = (err: Error) => {
      server.off('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });

  const address = server.address();
  const resolvedPort =
    typeof address === 'object' && address && 'port' in address ? address.port : port;

  return {
    port: resolvedPort,
    host,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
