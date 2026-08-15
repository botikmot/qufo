import {
  CalendarDays,
} from "lucide-react";

import {
  formatEnumLabel,
} from "@/utils/string";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardSubscriptionCardProps = {
  subscription:
    DashboardResponse["subscription"];
};

export function DashboardSubscriptionCard({
  subscription,
}: DashboardSubscriptionCardProps) {
  const trialing =
    subscription.status ===
    "TRIALING";

  return (
    <div className="qufo-surface rounded-2xl p-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-600">
            Subscription
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-200">
            {formatEnumLabel(
              subscription.plan,
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatEnumLabel(
              subscription.status,
            )}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/[0.07] text-violet-300">
          <CalendarDays
            size={18}
          />
        </div>
      </div>

      {trialing && (
        <div className="mt-5 rounded-xl border border-violet-400/10 bg-violet-400/[0.035] px-4 py-3">
          <p className="text-xs text-violet-200/70">
            {subscription.trialDaysRemaining}{" "}
            day
            {subscription.trialDaysRemaining ===
            1
              ? ""
              : "s"}{" "}
            remaining in your trial
          </p>
        </div>
      )}
    </div>
  );
}