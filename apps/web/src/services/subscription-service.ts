import { apiFetch } from "@/lib/api";

import type {
  RedeemAppSumoCodeResponse,
  SubscriptionBillingSummary,
  SubscriptionCheckoutResponse,
} from "@/types/subscription";

export async function getSubscriptionBilling() {
  return apiFetch<SubscriptionBillingSummary>(
    "/subscriptions/billing",
  );
}

export async function createSubscriptionCheckout(
  provider: "PAYMONGO" | "PAYPAL",
) {
  return apiFetch<SubscriptionCheckoutResponse>(
    "/subscriptions/billing/checkout",
    {
      method: "POST",

      body: JSON.stringify({
        provider,
      }),
    },
  );
}

export async function redeemAppSumoCode(
  code: string,
) {
  return apiFetch<RedeemAppSumoCodeResponse>(
    "/appsumo/redeem",
    {
      method:
        "POST",

      body:
        JSON.stringify({
          code:
            code.trim(),
        }),
    },
  );
}