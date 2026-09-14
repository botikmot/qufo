import type {
  AppSumoTier,
  DealifyTier,
  Subscription,
} from '../../generated/prisma/client';

import {
  getAppSumoEntitlements,
  type AppSumoEntitlements,
} from './appsumo-entitlements';

import {
  getDealifyEntitlements,
  type DealifyEntitlements,
} from './dealify-entitlements';

export type LifetimeEntitlements = {
  label: string;

  maxMembers: number;

  maxStorageBytes: number;

  monthlyCustomerEmailLimit: number;

  monthlyQuotationCredits: number;
};

type LifetimeSubscriptionInput = {
  status: Subscription['status'];
  source: Subscription['source'];
  accessType: Subscription['accessType'];

  appSumoTier: AppSumoTier | null;

  dealifyTier: DealifyTier | null;
};

export function getLifetimeEntitlements(
  subscription: LifetimeSubscriptionInput,
): LifetimeEntitlements | null {
  if (
    subscription.status !== 'ACTIVE' ||
    subscription.accessType !== 'LIFETIME'
  ) {
    return null;
  }

  if (subscription.source === 'APPSUMO' && subscription.appSumoTier) {
    const entitlements: AppSumoEntitlements = getAppSumoEntitlements(
      subscription.appSumoTier,
    );

    return {
      label: entitlements.label,
      maxMembers: entitlements.maxMembers,
      maxStorageBytes: entitlements.maxStorageBytes,
      monthlyCustomerEmailLimit: entitlements.monthlyCustomerEmailLimit,
      monthlyQuotationCredits: 0,
    };
  }

  if (subscription.source === 'DEALIFY' && subscription.dealifyTier) {
    const entitlements: DealifyEntitlements = getDealifyEntitlements(
      subscription.dealifyTier,
    );

    return {
      label: entitlements.label,
      maxMembers: entitlements.maxMembers,
      maxStorageBytes: entitlements.maxStorageBytes,
      monthlyCustomerEmailLimit: entitlements.monthlyCustomerEmailLimit,
      monthlyQuotationCredits: entitlements.monthlyQuotationCredits,
    };
  }

  return null;
}
