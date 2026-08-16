import type {
  SubscriptionSnapshot,
  SubscriptionStatus,
} from "@/types/subscription";

export function getEffectiveSubscriptionStatus(
  subscription:
    | SubscriptionSnapshot
    | null,
  now = new Date(),
):
  | SubscriptionStatus
  | null {
  if (!subscription) {
    return null;
  }

  if (
    subscription.status ===
    "TRIALING"
  ) {
    const trialEndsAt =
      new Date(
        subscription.trialEndsAt,
      );

    if (
      !Number.isNaN(
        trialEndsAt.getTime(),
      ) &&
      trialEndsAt < now
    ) {
      return "EXPIRED";
    }
  }

  if (
    subscription.status ===
      "ACTIVE" &&
    subscription.currentPeriodEnd
  ) {
    const currentPeriodEnd =
      new Date(
        subscription.currentPeriodEnd,
      );

    if (
      !Number.isNaN(
        currentPeriodEnd.getTime(),
      ) &&
      currentPeriodEnd < now
    ) {
      return "PAST_DUE";
    }
  }

  return subscription.status;
}

export function isSubscriptionWritable(
  status:
    | SubscriptionStatus
    | null,
) {
  return (
    status === "TRIALING" ||
    status === "ACTIVE"
  );
}

export function isWorkspaceReadOnly(
  subscription:
    | SubscriptionSnapshot
    | null,
) {
  const status =
    getEffectiveSubscriptionStatus(
      subscription,
    );

  return !isSubscriptionWritable(
    status,
  );
}