import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { createHmac, timingSafeEqual } from 'node:crypto';

type PayMongoCheckoutResponse = {
  data: {
    id: string;

    type: 'checkout_session';

    attributes: {
      checkout_url: string;

      livemode: boolean;

      reference_number: string | null;
    };
  };
};

type CreatePayMongoCheckoutInput = {
  paymentId: string;

  organizationName: string;

  amountCentavos: number;

  successUrl: string;

  cancelUrl: string;
};

@Injectable()
export class PayMongoService {
  private readonly apiUrl = 'https://api.paymongo.com';

  constructor(private readonly configService: ConfigService) {}

  private get subscriptionEnabled(): boolean {
    const value = this.configService.get<string>('SUBSCRIPTION_ENABLED');

    return value?.trim().toLowerCase() !== 'false';
  }

  private ensureSubscriptionEnabled(): void {
    if (!this.subscriptionEnabled) {
      throw new NotFoundException(
        'Subscription billing is not available in this deployment.',
      );
    }
  }

  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string) {
    this.ensureSubscriptionEnabled();

    const webhookSecret = this.configService.getOrThrow<string>(
      'PAYMONGO_WEBHOOK_SECRET',
    );

    const apiSecret = this.configService.getOrThrow<string>(
      'PAYMONGO_SECRET_KEY',
    );

    const parts = Object.fromEntries(
      signatureHeader.split(',').map((part) => {
        const [key, ...valueParts] = part.trim().split('=');

        return [key, valueParts.join('=')];
      }),
    );

    const timestamp = parts.t;

    if (!timestamp) {
      return false;
    }

    /*
     * sk_test_* → compare against te
     * sk_live_* → compare against li
     */
    const receivedSignature = apiSecret.startsWith('sk_test_')
      ? parts.te
      : parts.li;

    if (!receivedSignature) {
      return false;
    }

    /*
     * Reject old/replayed webhook
     * requests beyond 5 minutes.
     */
    const webhookTime = Number(timestamp) * 1000;

    if (!Number.isFinite(webhookTime)) {
      return false;
    }

    const age = Math.abs(Date.now() - webhookTime);

    if (age > 5 * 60 * 1000) {
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    const receivedBuffer = Buffer.from(receivedSignature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  }

  async createCheckoutSession(input: CreatePayMongoCheckoutInput) {
    this.ensureSubscriptionEnabled();

    const secretKey = this.configService.getOrThrow<string>(
      'PAYMONGO_SECRET_KEY',
    );

    const authorization = Buffer.from(`${secretKey}:`).toString('base64');

    const response = await fetch(`${this.apiUrl}/v2/checkout_sessions`, {
      method: 'POST',

      headers: {
        Authorization: `Basic ${authorization}`,

        'Content-Type': 'application/json',

        /*
         * Same internal payment =
         * same logical PayMongo
         * operation.
         */
        'Idempotency-Key': input.paymentId,
      },

      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                name: 'QUFO Standard — 1 Month',

                description: `QUFO subscription for ${input.organizationName}`,

                amount: input.amountCentavos,

                currency: 'PHP',

                quantity: 1,
              },
            ],

            payment_method_types: ['gcash', 'card', 'qrph'],

            success_url: input.successUrl,

            cancel_url: input.cancelUrl,

            reference_number: input.paymentId,

            send_email_receipt: true,

            show_description: true,

            show_line_items: true,

            metadata: {
              subscription_payment_id: input.paymentId,
            },
          },
        },
      }),
    });

    const data = (await response.json()) as
      | PayMongoCheckoutResponse
      | {
          errors?: Array<{
            detail?: string;
            code?: string;
          }>;
        };

    if (!response.ok) {
      const message =
        'errors' in data && data.errors?.[0]?.detail
          ? data.errors[0].detail
          : 'Unable to create PayMongo checkout session.';

      throw new BadGatewayException(message);
    }

    if (
      !('data' in data) ||
      !data.data?.id ||
      !data.data.attributes?.checkout_url
    ) {
      throw new BadGatewayException('Invalid response received from PayMongo.');
    }

    return {
      sessionId: data.data.id,

      checkoutUrl: data.data.attributes.checkout_url,
    };
  }
}
