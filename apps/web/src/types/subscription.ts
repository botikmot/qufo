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

export type SubscriptionPrice = {
  plan: SubscriptionPlan;
  amount: string;
  currency: string;
  periodMonths: number;
};

export type SubscriptionDetails = {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  trialStartedAt: string;
  trialEndsAt: string;

  currentPeriodStart:
    | string
    | null;

  currentPeriodEnd:
    | string
    | null;

  cancelAtPeriodEnd: boolean;

  cancelledAt:
    | string
    | null;
};

export type SubscriptionSettings = {
  id: string;

  plan: SubscriptionPlan;

  status: SubscriptionStatus;

  trialStartedAt:
    | string
    | null;

  trialEndsAt:
    | string
    | null;

  currentPeriodStart:
    | string
    | null;

  currentPeriodEnd:
    | string
    | null;

  cancelAtPeriodEnd: boolean;

  cancelledAt:
    | string
    | null;

  createdAt: string;

  updatedAt: string;
  trialDaysRemaining: number;
  daysRemaining: number;

};

export type SubscriptionBillingSummary = {
  subscription:
    SubscriptionSettings;

  effectiveStatus:
    SubscriptionStatus;

  trialDaysRemaining:
    number;

  daysRemaining:
    number;

  pricing:
    SubscriptionPrice;

  canRenew: boolean;
};

export type SubscriptionCheckoutResponse = {
  message?: string;

  payment: {
    id: string;

    provider:
      | "PAYMONGO"
      | "PAYPAL";

    providerReference:
      | string
      | null;

    amount: string;

    currency: string;

    status:
      | "PENDING"
      | "PAID"
      | "FAILED"
      | "CANCELLED"
      | "REFUNDED";

    checkoutUrl:
      | string
      | null;

    periodStart:
      | string
      | null;

    periodEnd:
      | string
      | null;
  };
};

export type SubscriptionPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type SubscriptionPaymentHistoryItem = {
  id: string;

  provider:
    | "PAYMONGO"
    | "PAYPAL";

  providerReference:
    | string
    | null;

  amount: string;

  currency: string;

  status:
    SubscriptionPaymentStatus;

  periodMonths: number;

  periodStart:
    | string
    | null;

  periodEnd:
    | string
    | null;

  paidAt:
    | string
    | null;

  failedAt:
    | string
    | null;

  cancelledAt:
    | string
    | null;

  refundedAt:
    | string
    | null;

  createdAt: string;
};

export type SubscriptionPaymentHistoryResponse = {
  payments:
    SubscriptionPaymentHistoryItem[];
};