import type {
  SubscriptionSnapshot,
} from "@/types/subscription";

export function getSubscriptionExpiry(
  subscription:
    | SubscriptionSnapshot
    | null
    | undefined,
) {
  if (!subscription) {
    return null;
  }

  if (
    subscription.status ===
    "TRIALING"
  ) {
    return subscription.trialEndsAt;
  }

  if (
    subscription.status ===
    "ACTIVE"
  ) {
    return subscription.currentPeriodEnd;
  }

  return (
    subscription.currentPeriodEnd ??
    subscription.trialEndsAt ??
    null
  );
}

export function getSubscriptionDaysRemaining(
  subscription:
    | SubscriptionSnapshot
    | null
    | undefined,
) {
  const expiry =
    getSubscriptionExpiry(
      subscription,
    );

  if (!expiry) {
    return null;
  }

  const diff =
    new Date(expiry).getTime() -
    Date.now();

  return Math.max(
    0,
    Math.ceil(
      diff /
        (1000 * 60 * 60 * 24),
    ),
  );
}