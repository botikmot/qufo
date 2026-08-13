export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "STAFF";

export type Subscription = {
  plan: string;
  status: string;
  trialEndsAt: string;
  currentPeriodEnd: string | null;
} | null;

export type LoginOrganization = {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  subscription: Subscription;
};

export type LoginResponse = {
  accessToken: string;

  user: {
    id: string;
    name: string;
    email: string;
  };

  organizations: LoginOrganization[];
};

export type AuthSession = {
  accessToken: string;

  user: {
    id: string;
    name: string;
    email: string;
  };

  organization: LoginOrganization;
};