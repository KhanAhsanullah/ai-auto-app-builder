import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import type { PlatformApi } from '../domain/platform-api.js';
import { parseBoomLaunchBody } from '../domain/map-boom-launch.js';
import { PlatformApiException } from '../errors.js';
import type { BoomLaunchHttpBody, PlatformApiListenResult } from '../types.js';

export interface CreatePlatformHttpServerOptions {
  api: PlatformApi;
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(payload));
  res.end(payload);
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

function matchTenantGet(pathname: string): string | undefined {
  const match = /^\/v1\/tenants\/([^/]+)\/?$/.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/** Node HTTP adapter for PlatformApi (health + Boom launch + tenant get). */
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
