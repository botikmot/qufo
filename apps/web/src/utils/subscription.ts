import type {
  SubscriptionSnapshot,
  SubscriptionStatus,
} from "@/types/subscription";

type SubscriptionPeriodData = {
  status:
    | SubscriptionStatus
    | null;

  trialEndsAt:
    | string
    | null;

  currentPeriodEnd:
    | string
    | null;
};

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
      trialEndsAt <= now
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
      currentPeriodEnd <= now
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

/*
 * Returns the date that currently
 * controls workspace access.
 *
 * TRIALING -> trialEndsAt
 * ACTIVE   -> currentPeriodEnd
 *
 * For expired/past-due records,
 * fall back to whichever period
 * date exists so it can still be
 * displayed in the UI.
 */
export function getSubscriptionExpiry(
  subscription:
    | SubscriptionPeriodData
    | null,
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

/*
 * Remaining days for whichever
 * subscription period is currently
 * controlling access.
 *
 * Never returns a negative number.
 */
export function getSubscriptionDaysRemaining(
  subscription:
    | SubscriptionPeriodData
    | null,
  now = new Date(),
) {
  const expiry =
    getSubscriptionExpiry(
      subscription,
    );

  if (!expiry) {
    return null;
  }

  const end =
    new Date(expiry);

  if (
    Number.isNaN(
      end.getTime(),
    )
  ) {
    return null;
  }

  const difference =
    end.getTime() -
    now.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24),
    ),
  );
}

export function formatSubscriptionDate(
  value:
    | string
    | Date
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}