import {
  AlertTriangle,
  CreditCard,
} from "lucide-react";

import type {
  SubscriptionStatus,
} from "@/types/subscription";

type WorkspaceReadOnlyBannerProps = {
  status:
    | SubscriptionStatus
    | null;
};

export function WorkspaceReadOnlyBanner({
  status,
}: WorkspaceReadOnlyBannerProps) {
  let title =
    "Subscription required · Workspace is read-only";

  let message =
    "Your existing records are still available. An active QUFO subscription is required to create or make changes.";

  if (
    status === "EXPIRED"
  ) {
    title =
      "Trial ended · Workspace is read-only";

    message =
      "Your QUFO trial has ended. Your records are safe and still available, but you need an active subscription to create or make changes.";
  }

  if (
    status === "PAST_DUE"
  ) {
    title =
      "Subscription requires renewal · Workspace is read-only";

    message =
      "Your records remain available. Renew your subscription to continue creating and updating business records.";
  }

  if (
    status === "CANCELLED"
  ) {
    title =
      "Subscription cancelled · Workspace is read-only";

    message =
      "Your records remain available. Reactivate your subscription to continue making changes in this workspace.";
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-400/15 bg-amber-400/[0.045] px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/[0.08] text-amber-300">
          <AlertTriangle
            size={17}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-amber-200">
              {title}
            </p>

            <CreditCard
              size={14}
              className="hidden text-amber-300/60 sm:block"
            />
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}