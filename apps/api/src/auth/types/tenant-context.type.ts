export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type SubscriptionPlan = 'STANDARD';

export type SubscriptionStatus =
  'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type TenantContext = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;

  role: OrganizationRole;

  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    trialEndsAt: Date;
    currentPeriodEnd: Date | null;
  } | null;
};
