export type SubscriptionPlan =
  | "STANDARD";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

export type SubscriptionSnapshot = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  trialEndsAt: string;
  currentPeriodEnd:
    | string
    | null;
};