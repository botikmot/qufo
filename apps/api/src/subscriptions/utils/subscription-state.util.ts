import type { SubscriptionStatus } from '../../generated/prisma/client';

type SubscriptionStateInput = {
  status: SubscriptionStatus;

  trialEndsAt: Date;

  currentPeriodEnd: Date | null;
};

export type EffectiveSubscriptionState = {
  status: SubscriptionStatus;

  trialDaysRemaining: number | null;
};

export function resolveSubscriptionState(
  subscription: SubscriptionStateInput,
  now = new Date(),
): EffectiveSubscriptionState {
  let status = subscription.status;

  /*
   * A trial is effectively expired
   * as soon as its end date passes,
   * even if the stored database
   * status has not yet been updated.
   */
  if (status === 'TRIALING' && subscription.trialEndsAt < now) {
    status = 'EXPIRED';
  }

  /*
   * An active paid subscription
   * becomes effectively past due
   * when its current paid period
   * has ended.
   */
  if (
    status === 'ACTIVE' &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd < now
  ) {
    status = 'PAST_DUE';
  }

  if (status === 'TRIALING') {
    const difference = subscription.trialEndsAt.getTime() - now.getTime();

    return {
      status,

      trialDaysRemaining: Math.max(
        0,
        Math.ceil(difference / (1000 * 60 * 60 * 24)),
      ),
    };
  }

  if (status === 'EXPIRED') {
    return {
      status,
      trialDaysRemaining: 0,
    };
  }

  return {
    status,
    trialDaysRemaining: null,
  };
}
