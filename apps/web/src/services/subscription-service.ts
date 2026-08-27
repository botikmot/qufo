import { apiFetch } from "@/lib/api";

import type {
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