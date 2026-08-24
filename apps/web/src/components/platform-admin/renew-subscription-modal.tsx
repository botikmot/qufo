"use client";

import {
  CalendarClock,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  PlatformTenantDetail,
} from "@/types/platform-admin";

type RenewSubscriptionModalProps = {
  tenant:
    PlatformTenantDetail;

  loading?: boolean;

  onClose: () => void;

  onConfirm: (
    durationMonths: number,
  ) => Promise<void>;
};

const durations = [
  {
    value: 1,
    label: "1 month",
  },
  {
    value: 3,
    label: "3 months",
  },
  {
    value: 6,
    label: "6 months",
  },
  {
    value: 12,
    label: "12 months",
  },
];

function addMonths(
  value: Date,
  months: number,
) {
  const result =
    new Date(value);

  const originalDay =
    result.getDate();

  result.setDate(1);

  result.setMonth(
    result.getMonth() +
      months,
  );

  const lastDay =
    new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0,
    ).getDate();

  result.setDate(
    Math.min(
      originalDay,
      lastDay,
    ),
  );

  return result;
}

function formatDate(
  value:
    | string
    | Date
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

export function RenewSubscriptionModal({
  tenant,
  loading = false,
  onClose,
  onConfirm,
}: RenewSubscriptionModalProps) {
  const [
    durationMonths,
    setDurationMonths,
  ] = useState(1);

  const currentExpiry =
    tenant.subscription
      ?.expiresAt ??
    tenant.subscription
      ?.currentPeriodEnd ??
    tenant.subscription
      ?.trialEndsAt ??
    null;

  const projectedStart =
    useMemo(() => {
      const now =
        new Date();

      if (!currentExpiry) {
        return now;
      }

      const expiry =
        new Date(
          currentExpiry,
        );

      return expiry > now
        ? expiry
        : now;
    }, [currentExpiry]);

  const projectedEnd =
    useMemo(
      () =>
        addMonths(
          projectedStart,
          durationMonths,
        ),
      [
        projectedStart,
        durationMonths,
      ],
    );

  async function handleConfirm() {
    await onConfirm(
      durationMonths,
    );
  }

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="qufo-surface w-full max-w-lg overflow-hidden rounded-3xl">
        <div className="flex items-start justify-between border-b border-[var(--qufo-border)] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
              <CalendarClock
                size={18}
              />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Renew subscription
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Extend access for{" "}
                {tenant.name}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <div>
            <p className="mb-3 text-sm text-slate-400">
              Duration
            </p>

            <div className="grid grid-cols-2 gap-3">
              {durations.map(
                (duration) => {
                  const selected =
                    durationMonths ===
                    duration.value;

                  return (
                    <button
                      key={
                        duration.value
                      }
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() =>
                        setDurationMonths(
                          duration.value,
                        )
                      }
                      className={[
                        "rounded-xl border px-4 py-3 text-sm font-medium transition",
                        selected
                          ? "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300"
                          : "border-[var(--qufo-border)] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-white",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        duration.label
                      }
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-4 border-b border-[var(--qufo-border)] px-4 py-4">
              <div>
                <p className="text-xs text-slate-600">
                  Current expiry
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {formatDate(
                    currentExpiry,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-600">
                  Status
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {tenant.subscription
                    ?.status ??
                    "NONE"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-4 py-4">
              <div>
                <p className="text-xs text-slate-600">
                  Renewal starts
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {formatDate(
                    projectedStart,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-600">
                  New expiry
                </p>

                <p className="mt-1 text-sm font-medium text-emerald-300">
                  {formatDate(
                    projectedEnd,
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-600">
            Existing remaining trial
            or subscription time will
            be preserved when
            applicable.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void handleConfirm()
            }
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50 sm:w-auto"
          >
            {loading && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            Confirm renewal
          </button>
        </div>
      </div>
    </div>
  );
}