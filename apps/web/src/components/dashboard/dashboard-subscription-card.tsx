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

  const readOnly =
    subscription.status ===
      "EXPIRED" ||
    subscription.status ===
      "PAST_DUE" ||
    subscription.status ===
      "CANCELLED" ||
    !subscription.status;

  return (
    <div className="qufo-surface rounded-2xl p-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-600">
            Subscription
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-200">
            {subscription.plan
              ? formatEnumLabel(
                  subscription.plan,
                )
              : "No plan"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subscription.status
              ? formatEnumLabel(
                  subscription.status,
                )
              : "Subscription required"}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/[0.07] text-violet-300">
          <CalendarDays
            size={18}
          />
        </div>
      </div>

      {trialing &&
        subscription.trialDaysRemaining !==
          null && (
          <div className="mt-5 rounded-xl border border-violet-400/10 bg-violet-400/[0.035] px-4 py-3">
            <p className="text-xs text-violet-200/70">
              {
                subscription
                  .trialDaysRemaining
              }{" "}
              day
              {subscription
                .trialDaysRemaining ===
              1
                ? ""
                : "s"}{" "}
              remaining in your trial
            </p>
          </div>
        )}

      {readOnly && (
        <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-4 py-3">
          <p className="text-xs leading-5 text-amber-200/70">
            Workspace is currently
            read-only.
          </p>
        </div>
      )}
    </div>
  );
}