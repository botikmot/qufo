export type PlatformSubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

export type PlatformSubscriptionPlan =
  | "STANDARD";

export type PlatformAdminDashboardStats = {
  totalTenants: number;
  trialing: number;
  active: number;
  expired: number;
  pastDue: number;
  expiringSoon: number;
  newThisMonth: number;
};

export type PlatformTenantOwner = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type PlatformTenantSubscription = {
  id: string;
  plan: PlatformSubscriptionPlan;
  status: PlatformSubscriptionStatus;

  trialStartedAt: string;
  trialEndsAt: string;

  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;

  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string | null;

  expiresAt?: string | null;
  daysRemaining?: number | null;
};

export type PlatformRecentTenant = {
  id: string;
  name: string;
  slug: string;
  businessType: string | null;
  createdAt: string;

  owner: PlatformTenantOwner | null;

  subscription:
    | PlatformTenantSubscription
    | null;

  daysRemaining: number | null;
};

export type PlatformAdminDashboardResponse = {
  stats: PlatformAdminDashboardStats;

  recentTenants: PlatformRecentTenant[];
};

export type PlatformTenantUsage = {
  members: number;
  customers: number;
  quotations: number;
  jobs: number;
  payments: number;
};

export type PlatformTenant = {
  id: string;
  name: string;
  slug: string;
  businessType: string | null;
  createdAt: string;

  owner: PlatformTenantOwner | null;

  subscription:
    | PlatformTenantSubscription
    | null;

  usage: PlatformTenantUsage;
};

export type PlatformTenantsResponse = {
  tenants: PlatformTenant[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};


export type PlatformTenantMember = {
  id: string;
  role:
    | "OWNER"
    | "ADMIN"
    | "MANAGER"
    | "STAFF";

  joinedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    status: string;
    lastLoginAt: string | null;
  };
};

export type PlatformTenantDetail = {
  id: string;
  name: string;
  slug: string;

  businessType: string | null;

  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;

  status: string;

  createdAt: string;
  updatedAt: string;

  owner:
    | {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatarUrl: string | null;
        status: string;
        lastLoginAt: string | null;
      }
    | null;

  subscription:
    | PlatformTenantSubscription
    | null;

  usage: PlatformTenantUsage;

  members:
    PlatformTenantMember[];
};

export type RenewPlatformTenantResponse = {
  message: string;

  tenant: {
    id: string;
    name: string;
  };

  subscription:
    | PlatformTenantSubscription
    | null;
};