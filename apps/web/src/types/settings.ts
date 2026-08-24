import { SubscriptionStatus } from "./subscription";

export type BusinessSettings = {
  id: string;
  name: string;
  slug: string;

  businessType:
    | string
    | null;

  email:
    | string
    | null;

  phone:
    | string
    | null;

  address:
    | string
    | null;

  logoUrl:
    | string
    | null;

  status: string;

  createdAt?: string;
  updatedAt: string;
};

export type UpdateBusinessSettingsData = {
  name?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
};

export type UpdateBusinessSettingsResponse = {
  message: string;

  organization: BusinessSettings;
};

export type ProfileSettings = {
  id: string;
  name: string;
  email: string;

  phone:
    | string
    | null;

  avatarUrl:
    | string
    | null;

  status: string;

  emailVerifiedAt:
    | string
    | null;

  lastLoginAt:
    | string
    | null;

  createdAt?: string;
  updatedAt: string;
};

export type UpdateProfileSettingsData = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
};

export type UpdateProfileSettingsResponse = {
  message: string;

  profile: ProfileSettings;
};

export type SubscriptionPlan =
  | "STANDARD";


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

  trialDaysRemaining:
    | number
    | null;

  daysRemaining:
    | number
    | null;

  cancelAtPeriodEnd: boolean;

  createdAt: string;
  updatedAt: string;
};