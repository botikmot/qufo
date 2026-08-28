import { Module } from '@nestjs/common';

import { SubscriptionPricingService } from './subscription-pricing.service';

import { SubscriptionsBillingController } from './subscriptions-billing.controller';

import { SubscriptionsBillingService } from './subscriptions-billing.service';
import { PayMongoService } from './providers/paymongo.service';
import { PayMongoWebhookController } from './webhooks/paymongo-webhook.controller';
import { PayPalWebhookController } from './webhooks/paypal-webhook.controller';
import { PayPalService } from './providers/paypal.service';

@Module({
  controllers: [
    SubscriptionsBillingController,
    PayMongoWebhookController,
    PayPalWebhookController,
  ],

  providers: [
    SubscriptionPricingService,
    SubscriptionsBillingService,
    PayMongoService,
    PayPalService,
  ],

  exports: [SubscriptionPricingService, SubscriptionsBillingService],
})
export class SubscriptionsModule {}
