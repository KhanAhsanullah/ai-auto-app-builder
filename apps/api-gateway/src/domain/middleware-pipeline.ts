import type { GatewayContext, GatewayResponse } from '../types.js';

export type GatewayNext = () => Promise<GatewayResponse>;

/** Middleware function in the gateway pipeline. */
export type GatewayMiddleware = (
  context: GatewayContext,
  next: GatewayNext,
) => Promise<GatewayResponse>;

/**
 * Compose middleware into an onion pipeline.
 * The terminal handler runs after all middleware call `next()`.
 */
export function composeGatewayPipeline(
  middlewares: readonly GatewayMiddleware[],
  terminal: (context: GatewayContext) => Promise<GatewayResponse>,
): (context: GatewayContext) => Promise<GatewayResponse> {
  return async (context: GatewayContext): Promise<GatewayResponse> => {
    let index = -1;

    const dispatch = async (i: number, current: GatewayContext): Promise<GatewayResponse> => {
      if (i <= index) {
        throw new Error('gateway next() called multiple times');
      }
      index = i;

      if (i === middlewares.length) {
        return terminal(current);
      }

      const middleware = middlewares[i];
      if (!middleware) {
        return terminal(current);
      }

      return middleware(current, async () => dispatch(i + 1, current));
    };

    return dispatch(0, context);
  };
}
