"use client";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  RotateCcw,
  X,
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
  const [
    cancelExpanded,
    setCancelExpanded,
  ] = useState(false);

  function closeCancellation() {
    if (loading) {
      return;
    }

    setCancelExpanded(
      false,
    );

    onCancellationReasonChange(
      "",
    );
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/[0.08] text-amber-300">
              <RotateCcw
                size={18}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-amber-200">
                Job cancelled
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This job is currently
                inactive. Reopening it
                will restore its previous
                production status.
              </p>
            </div>
          </div>

          {canReopen && (
            <button
              type="button"
              onClick={
                onReopen
              }
              disabled={
                loading
              }
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
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
          )}
        </div>
      </section>
    );
  }

  if (!canCancel) {
    return null;
  }

  if (!cancelExpanded) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          aria-expanded="false"
          aria-controls={`cancel-job-${job.id}`}
          onClick={() =>
            setCancelExpanded(
              true,
            )
          }
          disabled={
            loading
          }
          className="flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.035] px-4 py-2.5 text-sm text-red-300 transition hover:border-red-400/25 hover:bg-red-400/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AlertTriangle
            size={15}
          />

          Cancel job

          <ChevronDown
            size={15}
          />
        </button>
      </div>
    );
  }

  return (
    <section
      id={`cancel-job-${job.id}`}
      className="rounded-2xl border border-red-400/15 bg-red-400/[0.025] p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-400/[0.07] text-red-300">
          <AlertTriangle
            size={18}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-red-200">
                Cancel job
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                A cancellation reason is
                required. This action can
                be reversed by reopening
                the job.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close cancellation form"
              onClick={
                closeCancellation
              }
              disabled={
                loading
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
            >
              <X
                size={16}
              />
            </button>
          </div>

          <div className="mt-4">
            <label
              htmlFor={`cancellation-reason-${job.id}`}
              className="mb-2 block text-xs text-slate-500"
            >
              Cancellation reason
            </label>

            <textarea
              id={`cancellation-reason-${job.id}`}
              autoFocus
              rows={3}
              value={
                cancellationReason
              }
              onChange={(event) =>
                onCancellationReasonChange(
                  event.target.value,
                )
              }
              disabled={
                loading
              }
              className="qufo-input resize-none"
              placeholder="Example: Customer cancelled the order."
            />
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                closeCancellation
              }
              disabled={
                loading
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--qufo-border)] px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              <ChevronUp
                size={15}
              />

              Keep job
            </button>

            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                loading ||
                !cancellationReason.trim()
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
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

              Confirm cancellation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}