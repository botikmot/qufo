import type { AppSumoTier } from '../../generated/prisma/client';

const GIGABYTE = 1024 * 1024 * 1024;

export type AppSumoEntitlements = {
  label: string;

  /*
   * Includes the workspace owner.
   */
  maxMembers: number;

  maxStorageBytes: number;

  monthlyCustomerEmailLimit: number;
};

export const APPSUMO_ENTITLEMENTS = {
  TIER_1: {
    label: 'AppSumo Tier 1',

    maxMembers: 3,

    maxStorageBytes: 1 * GIGABYTE,

    monthlyCustomerEmailLimit: 250,
  },

  TIER_2: {
    label: 'AppSumo Tier 2',

    maxMembers: 10,

    maxStorageBytes: 5 * GIGABYTE,

    monthlyCustomerEmailLimit: 1000,
  },

  TIER_3: {
    label: 'AppSumo Tier 3',

    maxMembers: 25,

    maxStorageBytes: 15 * GIGABYTE,

    monthlyCustomerEmailLimit: 2500,
  },
} as const satisfies Record<AppSumoTier, AppSumoEntitlements>;

export function getAppSumoEntitlements(tier: AppSumoTier): AppSumoEntitlements {
  return APPSUMO_ENTITLEMENTS[tier];
}
