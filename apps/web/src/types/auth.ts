import type {
  SubscriptionSnapshot,
} from "@/types/subscription";

export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "STAFF";

export type PlatformRole =
  | "SUPER_ADMIN"
  | "SUPPORT";

export type Subscription =
  | SubscriptionSnapshot
  | null;

export type LoginOrganization = {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  subscription: Subscription;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;

  platformRole:
    | PlatformRole
    | null;
};

export type LoginResponse = {
  accessToken: string;

  user: AuthUser

  organizations:
    LoginOrganization[];
};

export type AuthSession = {
  accessToken: string;

  user: AuthUser

  organization:
    LoginOrganization;
};

export type GoogleProfile = {
  name: string;
  email: string;
  picture: string | null;
};

export type GoogleOnboardingResponse = {
  requiresOnboarding: true;

  profile: GoogleProfile;
};

export type GoogleSessionResponse =
  LoginResponse & {
    requiresOnboarding: false;
  };

export type GoogleAuthResponse =
  | GoogleOnboardingResponse
  | GoogleSessionResponse;