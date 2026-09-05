export type SubscriptionSource =
  | "DIRECT"
  | "APPSUMO";

export type SubscriptionAccessType =
  | "RECURRING"
  | "LIFETIME";

export type AppSumoTier =
  | "TIER_1"
  | "TIER_2"
  | "TIER_3";

export type AppSumoEntitlements = {
  label: string;

  maxMembers: number;

  maxStorageBytes: number;

  monthlyCustomerEmailLimit:
    number;
};

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

  source:
    SubscriptionSource;

  accessType:
    SubscriptionAccessType;

  appSumoTier:
    | AppSumoTier
    | null;

  appSumoActivatedAt:
    | string
    | null;

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

  cancelAtPeriodEnd:
    boolean;

  cancelledAt:
    | string
    | null;

  createdAt?: string;
  updatedAt?: string;

  effectiveStatus:
    SubscriptionStatus;

  /*
   * Lifetime subscriptions have
   * no expiration date.
   */
  trialDaysRemaining:
    | number
    | null;

  daysRemaining:
    | number
    | null;
};

export type SubscriptionBillingSummary = {
  subscription:
    SubscriptionSettings;

  entitlements:
    | AppSumoEntitlements
    | null;

  customerEmailUsage:
    | CustomerEmailUsage
    | null;

  storageUsage:
    | SubscriptionStorageUsage
    | null;

  pricing:
    SubscriptionPrice;

  canRenew:
    boolean;
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

export type CapturePayPalSubscriptionResponse = {
  processed: boolean;
  reason?: string;
  paymentId: string;
  status?: "PAID";
  captureId?: string;
  paidAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
};

export type RedeemAppSumoCodeResponse = {
  message: string;

  redeemed: boolean;

  alreadyRedeemed:
    boolean;

  subscription: {
    plan:
      SubscriptionPlan;

    status:
      SubscriptionStatus;

    source:
      SubscriptionSource;

    accessType:
      SubscriptionAccessType;

    appSumoTier:
      | AppSumoTier
      | null;

    appSumoActivatedAt:
      | string
      | null;
  };

  entitlements:
    AppSumoEntitlements;
};

export type CustomerEmailUsage = {
  used: number;

  limit: number;

  remaining: number;

  periodStart: string;

  resetsAt: string;
};

export type SubscriptionStorageUsage = {
  usedBytes: number;

  limitBytes: number;

  remainingBytes: number;

  percentageUsed: number;
};