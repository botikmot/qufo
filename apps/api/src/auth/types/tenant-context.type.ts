export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type SubscriptionPlan = 'STANDARD';

export type SubscriptionStatus =
  'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type SubscriptionSource = 'DIRECT' | 'APPSUMO';

export type SubscriptionAccessType = 'RECURRING' | 'LIFETIME';

export type AppSumoTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type TenantContext = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;

  role: OrganizationRole;

  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;

    source: SubscriptionSource;

    accessType: SubscriptionAccessType;

    appSumoTier: AppSumoTier | null;

    appSumoActivatedAt: Date | null;

    trialStartedAt: Date;
    trialEndsAt: Date;

    currentPeriodStart: Date | null;

    currentPeriodEnd: Date | null;
  } | null;
};
