import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { createVerify } from 'node:crypto';

type PayPalAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type PayPalOrderLink = {
  href: string;
  rel: string;
  method?: string;
};

type PayPalCreateOrderResponse = {
  id: string;
  status: string;
  links?: PayPalOrderLink[];
};

type CreatePayPalOrderInput = {
  paymentId: string;
  organizationName: string;
  amount: string;
  currency: 'USD';
  returnUrl: string;
  cancelUrl: string;
};

type PayPalCaptureOrderResponse = {
  id: string;

  status: string;

  purchase_units?: Array<{
    reference_id?: string;

    payments?: {
      captures?: Array<{
        id: string;

        status: string;

        amount?: {
          currency_code: string;
          value: string;
        };

        create_time?: string;
        update_time?: string;
      }>;
    };
  }>;
};

const CRC32_TABLE = Array.from(
  {
    length: 256,
  },
  (_, index) => {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    return value >>> 0;
  },
);

function calculateCrc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

type PayPalWebhookVerificationInput = {
  transmissionId: string;

  transmissionTime: string;

  certUrl: string;

  authAlgo: string;

  transmissionSig: string;
};

@Injectable()
export class PayPalService {
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

  private getApiUrl() {
    const environment = this.configService.get<string>('PAYPAL_ENVIRONMENT');

    return environment === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private readonly certificateCache = new Map<string, string>();

  private async getWebhookCertificate(certUrl: string) {
    const url = new URL(certUrl);

    /*
     * Prevent arbitrary server-side
     * certificate downloads.
     */
    const validHost =
      url.hostname === 'paypal.com' || url.hostname.endsWith('.paypal.com');

    if (url.protocol !== 'https:' || !validHost) {
      throw new BadGatewayException('Invalid PayPal certificate URL.');
    }

    const cached = this.certificateCache.get(certUrl);

    if (cached) {
      return cached;
    }

    const response = await fetch(certUrl);

    if (!response.ok) {
      throw new BadGatewayException(
        'Unable to retrieve PayPal webhook certificate.',
      );
    }

    const certificate = await response.text();

    this.certificateCache.set(certUrl, certificate);

    return certificate;
  }

  async verifyWebhookSignature(
    rawBody: Buffer,

    input: PayPalWebhookVerificationInput,
  ) {
    this.ensureSubscriptionEnabled();

    const webhookId =
      this.configService.getOrThrow<string>('PAYPAL_WEBHOOK_ID');

    if (input.authAlgo.toUpperCase() !== 'SHA256WITHRSA') {
      return false;
    }

    const crc32 = calculateCrc32(rawBody);

    /*
     * PayPal signed message:
     *
     * transmissionId
     * |transmissionTime
     * |webhookId
     * |CRC32(raw body)
     */
    const message = [
      input.transmissionId,
      input.transmissionTime,
      webhookId,
      crc32,
    ].join('|');

    const certificate = await this.getWebhookCertificate(input.certUrl);

    const signature = Buffer.from(input.transmissionSig, 'base64');

    const verifier = createVerify('SHA256');

    verifier.update(message);

    verifier.end();

    return verifier.verify(certificate, signature);
  }

  private async getAccessToken() {
    this.ensureSubscriptionEnabled();

    const clientId = this.configService.getOrThrow<string>('PAYPAL_CLIENT_ID');

    const clientSecret = this.configService.getOrThrow<string>(
      'PAYPAL_CLIENT_SECRET',
    );

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const response = await fetch(`${this.getApiUrl()}/v1/oauth2/token`, {
      method: 'POST',

      headers: {
        Authorization: `Basic ${credentials}`,

        'Content-Type': 'application/x-www-form-urlencoded',
      },

      body: 'grant_type=client_credentials',
    });

    const data = (await response.json()) as
      | PayPalAccessTokenResponse
      | {
          error?: string;
          error_description?: string;
        };

    if (!response.ok || !('access_token' in data)) {
      const message =
        'error_description' in data && data.error_description
          ? data.error_description
          : 'Unable to authenticate with PayPal.';

      throw new BadGatewayException(message);
    }

    return data.access_token;
  }

  async createOrder(input: CreatePayPalOrderInput) {
    this.ensureSubscriptionEnabled();

    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.getApiUrl()}/v2/checkout/orders`, {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${accessToken}`,

        'Content-Type': 'application/json',

        'PayPal-Request-Id': input.paymentId,

        Prefer: 'return=representation',
      },

      body: JSON.stringify({
        intent: 'CAPTURE',

        purchase_units: [
          {
            reference_id: input.paymentId,

            custom_id: input.paymentId,

            description: `QUFO Standard subscription for ${input.organizationName}`,

            amount: {
              currency_code: input.currency,

              value: input.amount,
            },
          },
        ],

        application_context: {
          brand_name: 'QUFO',

          user_action: 'PAY_NOW',

          shipping_preference: 'NO_SHIPPING',

          return_url: input.returnUrl,

          cancel_url: input.cancelUrl,
        },
      }),
    });

    const data = (await response.json()) as
      | PayPalCreateOrderResponse
      | {
          name?: string;
          message?: string;
          details?: Array<{
            description?: string;
          }>;
        };

    if (!response.ok || !('id' in data)) {
      const message =
        'details' in data && data.details?.[0]?.description
          ? data.details[0].description
          : 'Unable to create PayPal order.';

      throw new BadGatewayException(message);
    }

    const approvalUrl = data.links?.find(
      (link) => link.rel === 'approve' || link.rel === 'payer-action',
    )?.href;

    if (!approvalUrl) {
      throw new BadGatewayException('PayPal approval URL was not returned.');
    }

    return {
      orderId: data.id,

      status: data.status,

      approvalUrl,
    };
  }

  async captureOrder(orderId: string, paymentId: string) {
    this.ensureSubscriptionEnabled();

    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.getApiUrl()}/v2/checkout/orders/${encodeURIComponent(
        orderId,
      )}/capture`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${accessToken}`,

          'Content-Type': 'application/json',

          /*
           * Stable ID for this capture.
           * Helps protect against
           * duplicate capture requests.
           */
          'PayPal-Request-Id': `capture-${paymentId}`,

          Prefer: 'return=representation',
        },

        body: '{}',
      },
    );

    const data = (await response.json()) as
      | PayPalCaptureOrderResponse
      | {
          name?: string;
          message?: string;

          details?: Array<{
            description?: string;
          }>;
        };

    if (!response.ok || !('id' in data)) {
      const message =
        'details' in data && data.details?.[0]?.description
          ? data.details[0].description
          : 'Unable to capture PayPal order.';

      throw new BadGatewayException(message);
    }

    return data;
  }
}
