import { IsIn, IsString } from 'class-validator';

export const SUBSCRIPTION_PAYMENT_PROVIDERS = ['PAYMONGO', 'PAYPAL'] as const;

export type SubscriptionPaymentProvider =
  (typeof SUBSCRIPTION_PAYMENT_PROVIDERS)[number];

export class CreateSubscriptionCheckoutDto {
  @IsString()
  @IsIn(SUBSCRIPTION_PAYMENT_PROVIDERS)
  provider: SubscriptionPaymentProvider;
}
