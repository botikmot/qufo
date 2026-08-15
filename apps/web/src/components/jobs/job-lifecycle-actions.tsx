"use client";

import {
  AlertTriangle,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import type {
  Job,
} from "@/types/job";

type JobLifecycleActionsProps = {
  job: Job;

  cancellationReason: string;

  canCancel: boolean;
  canReopen: boolean;

  loading?: boolean;

  onCancellationReasonChange: (
    value: string,
  ) => void;

  onCancel: () => void;

  onReopen: () => void;
};

export function JobLifecycleActions({
  job,
  cancellationReason,
  canCancel,
  canReopen,
  loading = false,
  onCancellationReasonChange,
  onCancel,
  onReopen,
}: JobLifecycleActionsProps) {
  if (
    job.status ===
    "COMPLETED"
  ) {
    return null;
  }

  if (
    job.status ===
    "CANCELLED"
  ) {
    return (
      <section className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/[0.08] text-amber-300">
            <RotateCcw
              size={18}
            />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-200">
              Job cancelled
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              This production job is
              currently inactive.
              Reopening it will restore
              its previous production
              status.
            </p>

            {canReopen && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={
                    onReopen
                  }
                  disabled={
                    loading
                  }
                  className="flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-amber-200 disabled:opacity-50"
                >
                  {loading ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RotateCcw
                      size={15}
                    />
                  )}

                  Reopen job
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (!canCancel) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-red-400/15 bg-red-400/[0.025] p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-400/[0.07] text-red-300">
          <AlertTriangle
            size={18}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-red-200">
            Cancel job
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Use this only when
            production should no
            longer continue. A
            cancellation reason is
            required.
          </p>

          <div className="mt-4">
            <label className="mb-2 block text-xs text-slate-500">
              Cancellation reason
            </label>

            <textarea
              rows={3}
              value={
                cancellationReason
              }
              onChange={(event) =>
                onCancellationReasonChange(
                  event.target.value,
                )
              }
              className="qufo-input resize-none"
              placeholder="Example: Customer cancelled the order."
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                loading ||
                !cancellationReason.trim()
              }
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/[0.12] disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <AlertTriangle
                  size={15}
                />
              )}

              Cancel job
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}