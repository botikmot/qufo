'use client';

import { SubscriptionSettingsCard } from '@/components/settings/subscription-settings-card';

import { useSubscriptionSettings } from '@/hooks/use-subscription-settings';

export function SubscriptionSettingsTab() {
  const subscription = useSubscriptionSettings();

  if (subscription.loading) {
    return (
      <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
        Loading subscription...
      </div>
    );
  }

  if (!subscription.billing) {
    return (
      <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
        {subscription.error ?? 'Unable to load subscription.'}
      </div>
    );
  }

  return (
    <SubscriptionSettingsCard
      billing={subscription.billing}
      payments={subscription.payments}
      renewing={subscription.renewing}
      confirmingPayment={subscription.confirmingPayment}
      paymentResult={subscription.paymentResult}
      appSumoEnabled={subscription.appSumoEnabled}
      redeemingAppSumo={subscription.redeemingAppSumo}
      appSumoSuccess={subscription.appSumoSuccess}
      error={subscription.error}
      onRenew={subscription.renew}
      onRefresh={subscription.refresh}
      onRedeemAppSumo={subscription.redeemAppSumo}
    />
  );
}
