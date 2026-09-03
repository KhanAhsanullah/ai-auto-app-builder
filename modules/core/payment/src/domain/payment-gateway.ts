import type { PaymentIntent } from '../types.js';

/** Result returned by a gateway adapter after an authorize/capture call. */
export interface PaymentGatewayResult {
  /** Opaque id from Stripe / PayPal / etc. */
  providerReference?: string;
}

/**
 * Optional port for real payment providers.
 * When omitted, PaymentService only updates domain status (manual / test mode).
 */
export interface PaymentGatewayPort {
  authorize?(intent: PaymentIntent): Promise<PaymentGatewayResult>;
  capture?(intent: PaymentIntent): Promise<PaymentGatewayResult>;
}
