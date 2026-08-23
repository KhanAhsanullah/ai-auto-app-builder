import type { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';

import { toGatewayRequest, writeGatewayResponse } from '../src/infrastructure/node-http-adapter.js';
import type { GatewayResponse } from '../src/types.js';

function mockIncoming(input: {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: string;
  remoteAddress?: string;
}): IncomingMessage {
  const stream = Readable.from(input.body ? [Buffer.from(input.body)] : []) as IncomingMessage;
  Object.assign(stream, {
    method: input.method ?? 'GET',
    url: input.url ?? '/',
    headers: input.headers ?? {},
    socket: { remoteAddress: input.remoteAddress ?? '127.0.0.1' },
  });
  return stream;
}

describe('node-http-adapter', () => {
  it('maps IncomingMessage to GatewayRequest', async () => {
    const req = mockIncoming({
      method: 'GET',
      url: '/v1/items?limit=10',
      headers: {
        host: 'acme.example.com',
        'x-tenant-id': 'tenant-1',
      },
    });

    const gatewayRequest = await toGatewayRequest(req, {
      maxBodyBytes: 1024,
      trustProxy: false,
    });

    expect(gatewayRequest).toMatchObject({
      method: 'GET',
      path: '/v1/items',
      query: { limit: '10' },
      clientIp: '127.0.0.1',
    });
    expect(gatewayRequest.headers['x-tenant-id']).toBe('tenant-1');
  });

  it('parses JSON POST bodies', async () => {
    const req = mockIncoming({
      method: 'POST',
      url: '/v1/echo',
      headers: {
        host: 'localhost',
        'content-type': 'application/json',
      },
      body: '{"a":1}',
    });

    const gatewayRequest = await toGatewayRequest(req, {
      maxBodyBytes: 1024,
      trustProxy: false,
    });

    expect(gatewayRequest.body).toEqual({ a: 1 });
  });

  it('uses x-forwarded-for when trustProxy is enabled', async () => {
    const req = mockIncoming({
      headers: {
        host: 'localhost',
        'x-forwarded-for': '203.0.113.1, 10.0.0.1',
      },
      remoteAddress: '10.0.0.2',
    });

    const gatewayRequest = await toGatewayRequest(req, {
      maxBodyBytes: 1024,
      trustProxy: true,
    });

    expect(gatewayRequest.clientIp).toBe('203.0.113.1');
  });

  it('writes JSON GatewayResponse', () => {
    const res = {
      statusCode: 0,
      headersSent: false,
      setHeader: vi.fn(),
      end: vi.fn(),
      destroy: vi.fn(),
    } as unknown as ServerResponse;

    const response: GatewayResponse = {
      status: 201,
      headers: { 'x-request-id': 'abc' },
      body: { ok: true },
    };

    writeGatewayResponse(res, response);

    expect(res.statusCode).toBe(201);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'abc');
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json; charset=utf-8');
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ ok: true }));
  });
});
