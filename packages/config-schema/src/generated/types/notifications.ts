/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Notification channels, templates, and delivery policies for the tenant.
 */
export interface Notifications {
  channels: {
    email: boolean;
    sms?: boolean;
    push?: boolean;
    whatsapp?: boolean;
  };
  sender: {
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    /**
     * Alphanumeric SMS sender ID where supported.
     */
    smsSenderId?: string;
  };
  /**
   * Per-event channel enablement.
   */
  events: {
    orderConfirmed?: EventChannels;
    orderShipped?: EventChannels;
    orderDelivered?: EventChannels;
    orderCancelled?: EventChannels;
    paymentFailed?: EventChannels;
    passwordReset?: EventChannels;
    welcomeCustomer?: EventChannels;
  };
  /**
   * Template overrides keyed by event name.
   */
  templates?: {
    [k: string]: {
      subject?: string;
      /**
       * Reference to template asset ID.
       */
      bodyRef?: string;
    };
  };
  quietHours?: {
    enabled?: boolean;
    /**
     * 24h time HH:MM in tenant timezone.
     */
    start?: string;
    end?: string;
    channels?: ('sms' | 'push' | 'whatsapp')[];
  };
}
/**
 * This interface was referenced by `Notifications`'s JSON-Schema
 * via the `definition` "eventChannels".
 */
export interface EventChannels {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  whatsapp?: boolean;
}
