/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Payment gateway configuration, accepted methods, and checkout payment policies.
 */
export interface Payments {
  /**
   * Primary payment gateway for this tenant.
   */
  defaultGateway: 'stripe' | 'paypal' | 'razorpay' | 'jazzcash' | 'easypaisa' | 'manual' | 'custom';
  /**
   * @minItems 1
   */
  methods: [
    (
      | 'card'
      | 'wallet'
      | 'bank_transfer'
      | 'cash_on_delivery'
      | 'buy_now_pay_later'
      | 'apple_pay'
      | 'google_pay'
    ),
    ...(
      | 'card'
      | 'wallet'
      | 'bank_transfer'
      | 'cash_on_delivery'
      | 'buy_now_pay_later'
      | 'apple_pay'
      | 'google_pay'
    )[],
  ];
  gateways?: {
    provider: 'stripe' | 'paypal' | 'razorpay' | 'jazzcash' | 'easypaisa' | 'manual' | 'custom';
    enabled: boolean;
    mode?: 'sandbox' | 'live';
    /**
     * Reference to encrypted credentials in secrets store (not inline secrets).
     */
    credentialsRef?: string;
    supportedMethods?: string[];
  }[];
  checkout: {
    captureStrategy: 'immediate' | 'authorize_then_capture' | 'manual';
    allowSplitPayment?: boolean;
    minimumOrderAmount?: number;
    codEnabled?: boolean;
    codMaxAmount?: number;
  };
  refunds?: {
    autoApprove?: boolean;
    windowDays?: number;
  };
}
