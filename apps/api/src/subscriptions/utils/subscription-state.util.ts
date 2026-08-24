import type { SubscriptionStatus } from '../../generated/prisma/client';

type SubscriptionStateInput = {
  status: SubscriptionStatus;

  trialEndsAt: Date;

  currentPeriodEnd: Date | null;
};

export type EffectiveSubscriptionState = {
  status: SubscriptionStatus;

  /*
   * Keep this for existing
   * dashboard compatibility.
   */
  trialDaysRemaining: number | null;

  /*
   * Generic remaining access days.
   *
   * TRIALING -> trialEndsAt
   * ACTIVE   -> currentPeriodEnd
   */
  daysRemaining: number | null;
};

function getDaysRemaining(endDate: Date, now: Date) {
  const difference = endDate.getTime() - now.getTime();

  return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
}

export function resolveSubscriptionState(
  subscription: SubscriptionStateInput,
  now = new Date(),
): EffectiveSubscriptionState {
  let status = subscription.status;

  /*
   * Trial expires exactly when
   * trialEndsAt is reached.
   */
  if (status === 'TRIALING' && subscription.trialEndsAt <= now) {
    status = 'EXPIRED';
  }

  /*
   * Paid subscription becomes
   * past due exactly when the
   * paid period ends.
   */
  if (
    status === 'ACTIVE' &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd <= now
  ) {
    status = 'PAST_DUE';
  }

  /*
   * Active trial.
   */
  if (status === 'TRIALING') {
    const daysRemaining = getDaysRemaining(subscription.trialEndsAt, now);

    return {
      status,

      trialDaysRemaining: daysRemaining,

      daysRemaining,
    };
  }

  /*
   * Active paid subscription.
   */
  if (status === 'ACTIVE' && subscription.currentPeriodEnd) {
    return {
      status,

      trialDaysRemaining: null,

      daysRemaining: getDaysRemaining(subscription.currentPeriodEnd, now),
    };
  }

  /*
   * Expired trial.
   */
  if (status === 'EXPIRED') {
    return {
      status,

      trialDaysRemaining: 0,

      daysRemaining: 0,
    };
  }

  /*
   * PAST_DUE / CANCELLED /
   * other non-active states.
   */
  return {
    status,

    trialDaysRemaining: null,

    daysRemaining: 0,
  };
}
