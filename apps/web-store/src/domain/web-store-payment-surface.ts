import type {
  CaptureStrategy,
  CreatePaymentIntentInput,
  PaymentGateway,
  PaymentIntent,
  PaymentMethod,
  PaymentModule,
} from '@ai-commerce/module-payment';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { WebStorePaymentUnavailableException } from '../errors.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStorePaymentBinding {
  payments: PaymentModule;
  /** Defaults from tenant payments config when create omits them. */
  defaultGateway?: PaymentGateway;
  defaultCaptureStrategy?: CaptureStrategy;
}

type CreateIntentFields = Omit<CreatePaymentIntentInput, 'tenantId'> & {
  method: PaymentMethod;
};

/** Storefront payment access: create intent + capture/authorize. */
export class WebStorePaymentSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedWebStoreShell,
    private readonly binding: WebStorePaymentBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.payment');
  }

  async createPaymentIntent(input: CreateIntentFields): Promise<PaymentIntent> {
    const binding = this.requirePayments();
    return binding.payments.createPaymentIntent({
      ...input,
      tenantId: this.tenantId,
      gateway: input.gateway ?? binding.defaultGateway ?? 'manual',
      captureStrategy: input.captureStrategy ?? binding.defaultCaptureStrategy ?? 'manual',
    });
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().payments.getPaymentIntent(this.tenantId, paymentIntentId);
  }

  async getPaymentIntentByOrderId(orderId: string): Promise<PaymentIntent> {
    return this.requirePayments().payments.getPaymentIntentByOrderId(this.tenantId, orderId);
  }

  async authorizePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().payments.authorizePaymentIntent(this.tenantId, paymentIntentId);
  }

  async capturePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().payments.capturePaymentIntent(this.tenantId, paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().payments.cancelPaymentIntent(this.tenantId, paymentIntentId);
  }

  private requirePayments(): WebStorePaymentBinding {
    if (!this.binding) {
      throw new WebStorePaymentUnavailableException(
        'Payment module is not wired. Pass payments to createWebStore({ payments }).',
      );
    }
    if (!this.flags.isEnabled('modules.payment')) {
      throw new WebStorePaymentUnavailableException(
        'Payment module is disabled for this tenant (modules.payment).',
      );
    }
    return this.binding;
  }
}
