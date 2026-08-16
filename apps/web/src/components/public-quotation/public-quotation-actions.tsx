"use client";

import {
  Check,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

type PublicQuotationActionsProps = {
  loadingAction:
    | "approve"
    | "requestChanges"
    | "reject"
    | null;

  onRequestChanges: () => void;
  onApprove: () => void;
  onDecline: () => void;
};

export function PublicQuotationActions({
  loadingAction,
  onRequestChanges,
  onApprove,
  onDecline,
}: PublicQuotationActionsProps) {
  const loading =
    loadingAction !== null;

  return (
    <div className="border-t border-[var(--qufo-border)] bg-black/10 p-6 sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <ShieldCheck
              size={17}
              className="text-emerald-300"
            />

            Ready to proceed?
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Approving confirms
            that you agree with
            the quotation details
            above.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={
              onRequestChanges
            }
            disabled={
              loading
            }
            className="rounded-xl border border-[var(--qufo-border)] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-amber-400/[0.05] hover:text-amber-300 disabled:opacity-50"
          >
            Request changes
          </button>

          <button
            type="button"
            onClick={
              onApprove
            }
            disabled={
              loading
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loadingAction ===
            "approve" ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Check
                size={16}
              />
            )}

            Approve quotation
          </button>

          <button
            type="button"
            onClick={
              onDecline
            }
            disabled={
              loading
            }
            className="text-xs text-slate-600 underline-offset-4 transition hover:text-red-300 hover:underline disabled:opacity-50"
          >
            Decline quotation
          </button>
        </div>
      </div>
    </div>
  );
}