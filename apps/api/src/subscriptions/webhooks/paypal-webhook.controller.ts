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

import { PayPalService } from '../providers/paypal.service';
import { SubscriptionsBillingService } from '../subscriptions-billing.service';

type PayPalWebhookPayload = {
  id: string;

  event_type: string;

  resource?: {
    id?: string;

    status?: string;

    amount?: {
      value?: string;

      currency_code?: string;
    };

    create_time?: string;

    update_time?: string;

    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

@Controller('webhooks/paypal')
export class PayPalWebhookController {
  constructor(
    private readonly payPalService: PayPalService,
    private readonly billingService: SubscriptionsBillingService,
  ) {}

  @Post()
  async handleWebhook(
    @Req()
    request: RawBodyRequest<Request>,

    @Headers('paypal-transmission-id')
    transmissionId: string | undefined,

    @Headers('paypal-transmission-time')
    transmissionTime: string | undefined,

    @Headers('paypal-cert-url')
    certUrl: string | undefined,

    @Headers('paypal-auth-algo')
    authAlgo: string | undefined,

    @Headers('paypal-transmission-sig')
    transmissionSig: string | undefined,
  ) {
    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Missing PayPal webhook raw body.');
    }

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !authAlgo ||
      !transmissionSig
    ) {
      throw new UnauthorizedException(
        'Missing PayPal webhook signature headers.',
      );
    }

    const valid = await this.payPalService.verifyWebhookSignature(rawBody, {
      transmissionId,

      transmissionTime,

      certUrl,

      authAlgo,

      transmissionSig,
    });

    if (!valid) {
      console.error('[PayPal Webhook] Invalid signature.');

      throw new UnauthorizedException('Invalid PayPal webhook signature.');
    }

    console.log('[PayPal Webhook] Signature valid.');

    let payload: PayPalWebhookPayload;

    try {
      payload = JSON.parse(rawBody.toString('utf8')) as PayPalWebhookPayload;
    } catch {
      throw new BadRequestException('Invalid PayPal webhook payload.');
    }

    console.log('[PayPal Webhook] Event:', payload.event_type);

    console.log('[PayPal Webhook] Event ID:', payload.id);

    switch (payload.event_type) {
      /*
       * ---------------------------------------
       * Buyer approved PayPal order.
       *
       * Capture it even if browser disappears.
       * ---------------------------------------
       */
      case 'CHECKOUT.ORDER.APPROVED': {
        const orderId = payload.resource?.id;

        if (!orderId) {
          throw new BadRequestException('PayPal order ID is missing.');
        }

        const result =
          await this.billingService.handlePayPalOrderApprovedWebhook(orderId);

        console.log('[PayPal Webhook] Order approved processed:', result);

        return {
          received: true,
          eventType: payload.event_type,
          result,
        };
      }

      /*
       * ---------------------------------------
       * Capture completed.
       *
       * This is final payment confirmation.
       * ---------------------------------------
       */
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const resource = payload.resource;

        const orderId = resource?.supplementary_data?.related_ids?.order_id;

        const captureId = resource?.id;

        const amount = resource?.amount?.value;

        const currency = resource?.amount?.currency_code;

        if (!orderId || !captureId || !amount || !currency) {
          throw new BadRequestException('Incomplete PayPal capture webhook.');
        }

        const paidAt = resource.update_time
          ? new Date(resource.update_time)
          : resource.create_time
            ? new Date(resource.create_time)
            : new Date();

        const result =
          await this.billingService.handlePayPalCaptureCompletedWebhook({
            orderId,

            captureId,

            amount,

            currency,

            paidAt,
          });

        console.log('[PayPal Webhook] Capture completed processed:', result);

        return {
          received: true,
          eventType: payload.event_type,
          result,
        };
      }

      /*
       * ---------------------------------------
       * Capture failed / denied.
       * ---------------------------------------
       */
      case 'PAYMENT.CAPTURE.DENIED': {
        const orderId =
          payload.resource?.supplementary_data?.related_ids?.order_id;

        if (!orderId) {
          throw new BadRequestException('PayPal order ID is missing.');
        }

        const result =
          await this.billingService.handlePayPalCaptureDeniedWebhook(orderId);

        return {
          received: true,
          eventType: payload.event_type,
          result,
        };
      }

      default:
        console.log('[PayPal Webhook] Ignored event:', payload.event_type);

        return {
          received: true,
          ignored: true,
          eventType: payload.event_type,
        };
    }
  }
}
