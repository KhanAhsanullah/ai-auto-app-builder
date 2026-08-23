import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import type { GatewayRequest, GatewayResponse, HttpMethod } from '../types.js';

export interface NodeHttpAdapterOptions {
  /** Maximum request body size in bytes. Default 1 MiB. */
  maxBodyBytes?: number;
  /**
   * When true, prefer `x-forwarded-for` (left-most) for `clientIp`.
   * Default false.
   */
  trustProxy?: boolean;
}

/**
 * Create a Node.js `http.Server` that maps IncomingMessage → GatewayRequest,
 * runs the pipeline handler, and writes GatewayResponse to the socket.
 */
export function createNodeHttpServer(
  handle: (request: GatewayRequest) => Promise<GatewayResponse>,
  options: NodeHttpAdapterOptions = {},
): Server {
  const maxBodyBytes = options.maxBodyBytes ?? 1_048_576;
  const trustProxy = options.trustProxy ?? false;

  return createServer((req, res) => {
    void processRequest(req, res, handle, { maxBodyBytes, trustProxy });
  });
}

async function processRequest(
  req: IncomingMessage,
  res: ServerResponse,
  handle: (request: GatewayRequest) => Promise<GatewayResponse>,
  options: Required<NodeHttpAdapterOptions>,
): Promise<void> {
  try {
    const gatewayRequest = await toGatewayRequest(req, options);
    const gatewayResponse = await handle(gatewayRequest);
    writeGatewayResponse(res, gatewayResponse);
  } catch (error) {
    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : String(error);
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'internal_error', message }));
      return;
    }
    res.destroy(error instanceof Error ? error : undefined);
  }
}

export async function toGatewayRequest(
  req: IncomingMessage,
  options: Required<Pick<NodeHttpAdapterOptions, 'maxBodyBytes' | 'trustProxy'>>,
): Promise<GatewayRequest> {
  const host = headerValue(req.headers.host) ?? 'localhost';
  const url = new URL(req.url ?? '/', `http://${host}`);
  const body = await readBody(req, options.maxBodyBytes);
  const contentType = headerValue(req.headers['content-type'])?.toLowerCase() ?? '';

  let parsedBody: unknown = body;
  if (body !== undefined && contentType.includes('application/json')) {
    const text = Buffer.isBuffer(body) ? body.toString('utf8') : String(body);
    if (text.length > 0) {
      try {
        parsedBody = JSON.parse(text) as unknown;
      } catch {
        parsedBody = text;
      }
    } else {
      parsedBody = undefined;
    }
  } else if (Buffer.isBuffer(body)) {
    parsedBody = body.toString('utf8');
  }

  const headers: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key.toLowerCase()] = value;
  }

  const query: Record<string, string | string[] | undefined> = {};
  for (const key of url.searchParams.keys()) {
    const values = url.searchParams.getAll(key);
    query[key] = values.length <= 1 ? (values[0] ?? undefined) : values;
  }

  return {
    method: (req.method ?? 'GET').toUpperCase() as HttpMethod,
    path: url.pathname,
    headers,
    query: Object.keys(query).length > 0 ? query : undefined,
    body: parsedBody,
    clientIp: resolveClientIp(req, options.trustProxy),
  };
}

export function writeGatewayResponse(res: ServerResponse, response: GatewayResponse): void {
  res.statusCode = response.status;

  const headers = { ...(response.headers ?? {}) };
  let payload: string | Buffer | undefined;

  if (response.body === undefined || response.body === null) {
    payload = undefined;
  } else if (typeof response.body === 'string' || Buffer.isBuffer(response.body)) {
    payload = response.body;
    if (!hasHeader(headers, 'content-type')) {
      headers['content-type'] = Buffer.isBuffer(response.body)
        ? 'application/octet-stream'
        : 'text/plain; charset=utf-8';
    }
  } else {
    payload = JSON.stringify(response.body);
    if (!hasHeader(headers, 'content-type')) {
      headers['content-type'] = 'application/json; charset=utf-8';
    }
  }

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  res.end(payload);
}

async function readBody(req: IncomingMessage, maxBodyBytes: number): Promise<Buffer | undefined> {
  const method = (req.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'DELETE' || method === 'OPTIONS') {
    return undefined;
  }

  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBodyBytes) {
      throw new Error(`Request body exceeds limit of ${maxBodyBytes} bytes.`);
    }
    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return undefined;
  }
  return Buffer.concat(chunks);
}

function resolveClientIp(req: IncomingMessage, trustProxy: boolean): string | undefined {
  if (trustProxy) {
    const forwarded = headerValue(req.headers['x-forwarded-for']);
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) {
        return first;
      }
    }
  }

  return req.socket.remoteAddress;
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === lower);
}
