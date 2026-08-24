"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
} from "lucide-react";

import {
  formatSubscriptionDate,
  getSubscriptionDaysRemaining,
} from "@/utils/subscription";

import type {
  SubscriptionSettings,
} from "@/types/settings";

type SubscriptionSettingsCardProps = {
  subscription:
    SubscriptionSettings;
};

export function SubscriptionSettingsCard({
  subscription,
}: SubscriptionSettingsCardProps) {
  const trialing =
    subscription.status ===
    "TRIALING";

  const active =
    subscription.status ===
    "ACTIVE";

 const daysRemaining = subscription.daysRemaining;

  return (
    <div className="qufo-surface overflow-hidden rounded-3xl">
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
            <CreditCard
              size={18}
            />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Subscription
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View your QUFO plan
              and subscription
              status.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Plan */}
        <div className="qufo-surface-soft rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Current plan
              </div>

              <div className="mt-2 text-2xl font-semibold text-white">
                {subscription.plan
                  .charAt(0)
                  .toUpperCase() +
                  subscription.plan
                    .slice(1)
                    .toLowerCase()}
              </div>
            </div>

            <div
              className={[
                "w-fit rounded-full border px-3 py-1.5 text-xs font-medium",
                active
                  ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300"
                  : trialing
                    ? "border-violet-400/15 bg-violet-400/[0.07] text-violet-300"
                    : "border-amber-400/15 bg-amber-400/[0.07] text-amber-300",
              ].join(" ")}
            >
              {trialing
                ? "Trial active"
                : subscription.status}
            </div>
          </div>

          {daysRemaining !== null &&
            (trialing ||
              active) && (
              <div className="mt-5 border-t border-[var(--qufo-border)] pt-5">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock3
                    size={16}
                    className="text-emerald-300"
                  />

                  <span>
                    <strong className="font-medium text-white">
                      {
                        daysRemaining
                      }
                    </strong>{" "}
                    {daysRemaining ===
                    1
                      ? "day"
                      : "days"}{" "}
                    remaining
                  </span>
                </div>

                <p className="mt-2 pl-6 text-xs text-slate-500">
                  {trialing
                    ? "Trial ends"
                    : "Active until"}{" "}
                  {formatSubscriptionDate(
                    trialing
                      ? subscription.trialEndsAt
                      : subscription.currentPeriodEnd,
                  )}
                </p>
              </div>
            )}
        </div>

        {/* Dates */}
        {trialing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <DateCard
              label="Trial started"
              value={
                subscription.trialStartedAt
              }
            />

            <DateCard
              label="Trial ends"
              value={
                subscription.trialEndsAt
              }
            />
          </div>
        ) : active ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateCard
                label="Paid period starts"
                value={
                  subscription.currentPeriodStart
                }
              />

              <DateCard
                label="Active until"
                value={
                  subscription.currentPeriodEnd
                }
              />
            </div>

            {/* Trial history */}
            <div className="rounded-xl border border-[var(--qufo-border)] bg-white/[0.015] px-4 py-3">
              <p className="text-xs text-slate-600">
                Original trial:{" "}
                {formatSubscriptionDate(
                  subscription.trialStartedAt,
                )}{" "}
                –{" "}
                {formatSubscriptionDate(
                  subscription.trialEndsAt,
                )}
              </p>
            </div>
          </>
        ) : null}

        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
          <div className="flex gap-3">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-cyan-300"
            />

            <div>
              <div className="text-sm font-medium text-slate-200">
                QUFO Standard
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your workspace
                currently has access
                to quotations,
                customers, jobs,
                payments, and
                customer tracking.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs leading-5 text-slate-600">
          Subscription renewals are
          currently managed through
          QUFO support.
        </p>
      </div>
    </div>
  );
}

function DateCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="qufo-surface-soft rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays
          size={15}
        />

        {label}
      </div>

      <div className="mt-2 text-sm font-medium text-slate-200">
        {formatSubscriptionDate(
          value,
        )}
      </div>
    </div>
  );
}