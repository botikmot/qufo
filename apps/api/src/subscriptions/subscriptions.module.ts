import { Module } from '@nestjs/common';

import { SubscriptionPricingService } from './subscription-pricing.service';

import { SubscriptionsBillingController } from './subscriptions-billing.controller';

import { SubscriptionsBillingService } from './subscriptions-billing.service';
import { PayMongoService } from './providers/paymongo.service';
import { PayMongoWebhookController } from './webhooks/paymongo-webhook.controller';

@Module({
  controllers: [SubscriptionsBillingController, PayMongoWebhookController],

  providers: [
    SubscriptionPricingService,
    SubscriptionsBillingService,
    PayMongoService,
  ],

  exports: [SubscriptionPricingService, SubscriptionsBillingService],
})
export class SubscriptionsModule {}
