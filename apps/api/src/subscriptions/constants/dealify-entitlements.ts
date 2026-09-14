import type { DealifyTier } from '../../generated/prisma/client';

export type DealifyEntitlements = {
  label: string;
  maxMembers: number;
  maxStorageBytes: number;
  monthlyCustomerEmailLimit: number;
  monthlyQuotationCredits: number;
};

const GIGABYTE = 1024 * 1024 * 1024;

export const DEALIFY_ENTITLEMENTS = {
  TIER_2: {
    label: 'Dealify Tier 2',

    maxMembers: 10,

    maxStorageBytes: 5 * GIGABYTE,

    monthlyCustomerEmailLimit: 1000,

    monthlyQuotationCredits: 150,
  },

  TIER_3: {
    label: 'Dealify Tier 3',

    maxMembers: 25,

    maxStorageBytes: 15 * GIGABYTE,

    monthlyCustomerEmailLimit: 2500,

    monthlyQuotationCredits: 500,
  },
} as const satisfies Record<DealifyTier, DealifyEntitlements>;

export function getDealifyEntitlements(tier: DealifyTier): DealifyEntitlements {
  return DEALIFY_ENTITLEMENTS[tier];
}
