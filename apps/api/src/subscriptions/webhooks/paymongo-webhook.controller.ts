import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import type { RawBodyRequest } from '@nestjs/common';

import type { Request } from 'express';

import { PayMongoService } from '../providers/paymongo.service';

import { SubscriptionsBillingService } from '../subscriptions-billing.service';

type PayMongoPayment = {
  id: string;

  type: 'payment';

  attributes: {
    status?: string;

    amount?: number;

    currency?: string;

    paid_at?: number | null;
  };
};

type PayMongoCheckoutSession = {
  id: string;

  type: 'checkout_session';

  attributes: {
    paid_at?: number | null;

    reference_number?: string | null;

    metadata?: {
      subscription_payment_id?: string;
    } | null;

    payments?: PayMongoPayment[];
  };
};

type PayMongoWebhookPayload = {
  data: {
    id: string;

    type: 'event';

    attributes: {
      type: string;

      livemode: boolean;

      data: PayMongoCheckoutSession;

      previous_data?: Record<string, unknown>;

      pending_webhooks?: number;

      created_at?: number;

      updated_at?: number;
    };
  };
};

@Controller('webhooks/paymongo')
export class PayMongoWebhookController {
  constructor(
    private readonly payMongoService: PayMongoService,

    private readonly subscriptionsBillingService: SubscriptionsBillingService,
  ) {}

  @Post()
  async handleWebhook(
    @Req()
    request: RawBodyRequest<Request>,

    @Headers('paymongo-signature')
    signature: string | undefined,
  ) {
    /*
     * --------------------------------------------
     * 1. Raw body
     * --------------------------------------------
     */

    const rawBody = request.rawBody;

    if (!rawBody) {
      console.error('[PayMongo Webhook] Missing raw body.');

      throw new BadRequestException('Missing webhook raw body.');
    }

    /*
     * --------------------------------------------
     * 2. Signature header
     * --------------------------------------------
     */

    if (!signature) {
      console.error('[PayMongo Webhook] Missing signature.');

      throw new UnauthorizedException('Missing PayMongo webhook signature.');
    }

    /*
     * --------------------------------------------
     * 3. Verify signature
     * --------------------------------------------
     */

    const isValidSignature = this.payMongoService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValidSignature) {
      console.error('[PayMongo Webhook] Invalid signature.');

      throw new UnauthorizedException('Invalid PayMongo webhook signature.');
    }

    console.log('[PayMongo Webhook] Signature valid.');

    /*
     * --------------------------------------------
     * 4. Parse payload
     * --------------------------------------------
     */

    let payload: PayMongoWebhookPayload;

    try {
      payload = JSON.parse(rawBody.toString('utf8')) as PayMongoWebhookPayload;
    } catch (error) {
      console.error('[PayMongo Webhook] Invalid JSON.', error);

      throw new BadRequestException('Invalid PayMongo webhook payload.');
    }

    console.log(
      '[PayMongo Webhook] Payload:',
      JSON.stringify(payload, null, 2),
    );

    /*
     * --------------------------------------------
     * 5. Extract event
     *
     * Actual PayMongo structure:
     *
     * data.type = "event"
     *
     * data.attributes.type =
     * "checkout_session.payment.paid"
     *
     * data.attributes.data =
     * Checkout Session
     * --------------------------------------------
     */

    const eventType = payload.data?.attributes?.type ?? null;

    const checkout = payload.data?.attributes?.data ?? null;

    console.log('[PayMongo Webhook] Event type:', eventType);

    /*
     * --------------------------------------------
     * 6. Ignore unsupported events
     * --------------------------------------------
     */

    if (eventType !== 'checkout_session.payment.paid') {
      console.log('[PayMongo Webhook] Event ignored:', eventType);

      return {
        received: true,
        ignored: true,
        eventType,
      };
    }

    if (!checkout || checkout.type !== 'checkout_session') {
      console.error('[PayMongo Webhook] Missing checkout session.');

      throw new BadRequestException('Checkout session is missing.');
    }

    /*
     * --------------------------------------------
     * 7. Checkout details
     * --------------------------------------------
     */

    const attributes = checkout.attributes;

    console.log('[PayMongo Webhook] Checkout session:', checkout.id);

    console.log(
      '[PayMongo Webhook] Reference number:',
      attributes.reference_number,
    );

    console.log('[PayMongo Webhook] Metadata:', attributes.metadata);

    console.log('[PayMongo Webhook] paid_at:', attributes.paid_at);

    /*
     * --------------------------------------------
     * 8. Resolve QUFO SubscriptionPayment ID
     *
     * Prefer metadata.
     * Fall back to reference_number.
     * --------------------------------------------
     */

    const subscriptionPaymentId =
      attributes.metadata?.subscription_payment_id ??
      attributes.reference_number ??
      null;

    if (!subscriptionPaymentId) {
      console.error('[PayMongo Webhook] Missing subscription payment ID.');

      throw new BadRequestException(
        'Subscription payment reference is missing.',
      );
    }

    console.log(
      '[PayMongo Webhook] SubscriptionPayment ID:',
      subscriptionPaymentId,
    );

    /*
     * --------------------------------------------
     * 9. Double-check payment status
     * --------------------------------------------
     */

    const paidPayment = attributes.payments?.find(
      (payment) => payment.attributes.status === 'paid',
    );

    const isPaid = Boolean(attributes.paid_at) || Boolean(paidPayment);

    if (!isPaid) {
      console.warn(
        '[PayMongo Webhook] Paid event received but no paid payment found.',
      );

      return {
        received: true,
        ignored: true,
        reason: 'payment_not_paid',
      };
    }

    /*
     * --------------------------------------------
     * 10. Resolve PayMongo paid timestamp
     * --------------------------------------------
     */

    const paidAtUnix =
      attributes.paid_at ?? paidPayment?.attributes.paid_at ?? null;

    const paidAt = paidAtUnix ? new Date(paidAtUnix * 1000) : new Date();

    console.log('[PayMongo Webhook] Paid at:', paidAt.toISOString());

    /*
     * --------------------------------------------
     * 11. Update QUFO subscription
     * --------------------------------------------
     */

    console.log('[PayMongo Webhook] Processing payment...');

    const result =
      await this.subscriptionsBillingService.handlePayMongoPaidWebhook({
        subscriptionPaymentId,

        checkoutSessionId: checkout.id,

        paidAt,
      });

    console.log('[PayMongo Webhook] Successfully processed:', result);

    /*
     * --------------------------------------------
     * 12. Acknowledge PayMongo
     * --------------------------------------------
     */

    return {
      received: true,
      processed: true,
      eventType,
      result,
    };
  }
}
