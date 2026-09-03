/** Money amount in major units with an ISO-4217 currency code. */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Payment intent lifecycle.
 * Capture / fail / refund transitions land in later Sprint 18 tasks.
 */
export type PaymentIntentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled';

/** Accepted tender types (aligned with tenant `payments.methods`). */
export type PaymentMethod =
  | 'card'
  | 'wallet'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'buy_now_pay_later'
  | 'apple_pay'
  | 'google_pay';

/** Gateway id (aligned with tenant `payments.defaultGateway`). */
export type PaymentGateway =
  'stripe' | 'paypal' | 'razorpay' | 'jazzcash' | 'easypaisa' | 'manual' | 'custom';

/** How funds are captured (aligned with tenant `payments.checkout.captureStrategy`). */
export type CaptureStrategy = 'immediate' | 'authorize_then_capture' | 'manual';

/** Tenant-scoped payment intent created against an order. */
export interface PaymentIntent {
  tenantId: string;
  id: string;
  orderId: string;
  checkoutId: string;
  customerId?: string;
  status: PaymentIntentStatus;
  amount: Money;
  method: PaymentMethod;
  gateway: PaymentGateway;
  captureStrategy: CaptureStrategy;
  /** Opaque provider reference when a real gateway is wired (deferred). */
  providerReference?: string;
  createdAt: string;
  updatedAt: string;
  authorizedAt?: string;
  capturedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  failureReason?: string;
}

/** Input for creating a payment intent from an order. */
export interface CreatePaymentIntentInput {
  tenantId: string;
  orderId: string;
  method: PaymentMethod;
  /** Defaults to `manual` when omitted (no live gateway yet). */
  gateway?: PaymentGateway;
  /** Defaults to `manual` when omitted. */
  captureStrategy?: CaptureStrategy;
  id?: string;
  /** Override / set customer id when order snapshot has none. */
  customerId?: string;
}

/** Filters for listing payment intents within a tenant. */
export interface ListPaymentIntentsOptions {
  orderId?: string;
  status?: PaymentIntentStatus | readonly PaymentIntentStatus[];
}
