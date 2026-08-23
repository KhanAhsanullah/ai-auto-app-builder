import type { Server } from 'node:http';

import type { GatewayRequest, GatewayResponse } from '../types.js';
import type { RouteMatcher } from './route-matcher.js';

export interface ApiGatewayListenResult {
  /** Bound Node HTTP server. */
  server: Server;
  /** Resolved listen port (useful when port `0` was requested). */
  port: number;
  /** Hostname the server is listening on. */
  host: string;
  /** Stop accepting connections and close the server. */
  close: () => Promise<void>;
}

export interface ApiGatewayListenOptions {
  /** Host to bind. Default `127.0.0.1`. */
  host?: string;
  /**
   * Optional Node HTTP adapter tweaks (body size, trust proxy).
   * Applied when `listen` / `createHttpServer` build the adapter.
   */
  adapter?: {
    maxBodyBytes?: number;
    trustProxy?: boolean;
  };
}

export interface ApiGatewayDeps {
  /** Framework-agnostic request pipeline. */
  handle: (request: GatewayRequest) => Promise<GatewayResponse>;
  routeMatcher: RouteMatcher;
  /** Creates a Node `http.Server` that delegates to `handle`. */
  createHttpServer: (adapterOptions?: ApiGatewayListenOptions['adapter']) => Server;
}

/**
 * Public facade for the API gateway pipeline and Node HTTP binding (Sprint 7 Task 3).
 */
export class ApiGateway {
  constructor(private readonly deps: ApiGatewayDeps) {}

  /** Run a single framework-agnostic request through the gateway pipeline. */
  handle(request: GatewayRequest): Promise<GatewayResponse> {
    return this.deps.handle(request);
  }

  /** Registered route table (read-only introspection). */
  get routes(): RouteMatcher {
    return this.deps.routeMatcher;
  }

  /** Create an unbound Node HTTP server for custom listen / TLS wiring. */
  createHttpServer(adapterOptions?: ApiGatewayListenOptions['adapter']): Server {
    return this.deps.createHttpServer(adapterOptions);
  }

  /**
   * Bind a Node HTTP server and start listening.
   * Pass `port: 0` to let the OS assign an ephemeral port.
   */
  async listen(
    port: number,
    options: ApiGatewayListenOptions = {},
  ): Promise<ApiGatewayListenResult> {
    const host = options.host ?? '127.0.0.1';
    const server = this.createHttpServer(options.adapter);

    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        server.off('listening', onListening);
        reject(error);
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
    if (!address || typeof address === 'string') {
      await closeServer(server);
      throw new Error('API gateway server did not bind to a TCP address.');
    }

    return {
      server,
      port: address.port,
      host: address.address,
      close: () => closeServer(server),
    };
  }
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
