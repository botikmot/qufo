"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  formatSubscriptionDate,
} from "@/utils/subscription";

import type {
  SubscriptionBillingSummary,
  SubscriptionPaymentHistoryItem,
} from "@/types/subscription";

const SUBSCRIPTION_ENABLED = process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== "false";

type SubscriptionSettingsCardProps = {
  billing:
    SubscriptionBillingSummary;
  
  payments:
    SubscriptionPaymentHistoryItem[];

  renewing: boolean;

  confirmingPayment: boolean;

  paymentResult:
    string | null;

  error:
    string | null;

  onRenew:
    () => Promise<void>;

  onRefresh:
    () => Promise<SubscriptionBillingSummary | null>;
};

export function SubscriptionSettingsCard({
  billing,
  payments,
  renewing,
  confirmingPayment,
  paymentResult,
  error,
  onRenew,
  onRefresh,
}: SubscriptionSettingsCardProps) {

  if (!SUBSCRIPTION_ENABLED) {
    return null;
  }

  const subscription =
    billing.subscription;

  const status =
    billing.effectiveStatus ??
    subscription.status;

  const trialing =
    status ===
    "TRIALING";

  const active =
    status ===
    "ACTIVE";

  const daysRemaining =
    trialing
      ? billing.subscription.trialDaysRemaining
      : billing.subscription.daysRemaining;

  const phpBilling =
    billing.pricing
      .currency ===
    "PHP";

  const price =
    new Intl.NumberFormat(
      phpBilling
        ? "en-PH"
        : "en-US",
      {
        style:
          "currency",

        currency:
          billing.pricing
            .currency,

        minimumFractionDigits:
          2,
      },
    ).format(
      Number(
        billing.pricing
          .amount,
      ),
    );

  function formatSubscriptionStatus(
    status:
      | string
      | null
      | undefined,
  ) {
    if (!status) {
      return "Unknown";
    }

    return status
      .split("_")
      .map(
        (part) =>
          part.charAt(0).toUpperCase() +
          part.slice(1).toLowerCase(),
      )
      .join(" ");
  }


  return (
    <div className="space-y-4">
      {paymentResult ===
        "success" && (
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
          <div className="flex gap-3">
            {confirmingPayment ? (
              <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-emerald-300" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
            )}

            <div>
              <div className="text-sm font-medium text-emerald-200">
                {confirmingPayment
                  ? "Confirming your payment"
                  : active
                    ? "Payment confirmed"
                    : "Payment submitted"}
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {confirmingPayment
                  ? "QUFO is waiting for PayMongo to confirm the payment."
                  : active
                    ? "Your subscription has been updated successfully."
                    : "Payment confirmation may take a moment. You can refresh the status below."}
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentResult ===
        "cancelled" && (
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />

            <div>
              <div className="text-sm font-medium text-amber-200">
                Checkout cancelled
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                No subscription payment
                was completed.
              </p>
            </div>
          </div>
        </div>
      )}

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
                Manage your QUFO
                plan, billing and
                renewal.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="qufo-surface-soft rounded-2xl p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Current plan
                </div>

                <div className="mt-2 text-2xl font-semibold text-white">
                  QUFO Standard
                </div>

                <div className="mt-2">
                  <span
                    className={[
                      "inline-flex rounded-full border px-3 py-1.5 text-xs font-medium",

                      active
                        ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300"
                        : trialing
                          ? "border-violet-400/15 bg-violet-400/[0.07] text-violet-300"
                          : "border-amber-400/15 bg-amber-400/[0.07] text-amber-300",
                    ].join(
                      " ",
                    )}
                  >
                    {trialing
                      ? "Trial active"
                      : formatSubscriptionStatus(
                          status,
                        )}
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Monthly
                </div>

                <div className="mt-2 text-2xl font-semibold text-white">
                  {price}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  per month
                </div>
              </div>
            </div>

            {(trialing ||
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
                  Access quotations,
                  customers, jobs,
                  payments, reports,
                  and customer
                  tracking.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-[var(--qufo-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">
                {trialing
                  ? "Renew before your trial ends"
                  : active
                    ? "Extend your subscription"
                    : "Restore workspace access"}
              </p>

              <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                {trialing
                  ? "Paying early keeps your remaining trial. Your paid month begins after the trial ends."
                  : active
                    ? "Renewing early adds the next month after your current subscription period."
                    : "Renew your subscription to restore full workspace actions."}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={
                  confirmingPayment
                }
                onClick={() => {
                  void onRefresh();
                }}
              >
                <RefreshCw
                  size={16}
                />

                Refresh
              </Button>

              {billing.canRenew && (
                <Button
                  className="rounded-xl"
                  disabled={
                    renewing ||
                    confirmingPayment
                  }
                  onClick={() => {
                    void onRenew();
                  }}
                >
                  {renewing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />

                      Opening...
                    </>
                  ) : (
                    <>
                      <CreditCard
                        size={16}
                      />

                      Renew subscription
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="qufo-surface overflow-hidden rounded-3xl">
        <div className="border-b border-[var(--qufo-border)] px-6 py-5">
          <div>
            <h2 className="font-medium text-white">
              Billing History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Subscription payments and
              renewal history.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CreditCard
              size={24}
              className="mx-auto text-slate-600"
            />

            <p className="mt-3 text-sm text-slate-400">
              No subscription payments yet.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Your completed renewals will
              appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--qufo-border)]">
            {payments.map(
              (payment) => (
                <BillingHistoryRow
                  key={
                    payment.id
                  }
                  payment={
                    payment
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function DateCard({
  label,
  value,
}: {
  label: string;

  value:
    | string
    | null;
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

function BillingHistoryRow({
  payment,
}: {
  payment:
    SubscriptionPaymentHistoryItem;
}) {
  const amount =
    new Intl.NumberFormat(
      payment.currency ===
        "PHP"
        ? "en-PH"
        : "en-US",
      {
        style:
          "currency",

        currency:
          payment.currency,

        minimumFractionDigits:
          2,
      },
    ).format(
      Number(
        payment.amount,
      ),
    );

  const paid =
    payment.status ===
    "PAID";

  const pending =
    payment.status ===
    "PENDING";

  return (
    <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-200">
            {amount}
          </span>

          <span
            className={[
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",

              paid
                ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300"
                : pending
                  ? "border-amber-400/15 bg-amber-400/[0.07] text-amber-300"
                  : "border-red-400/15 bg-red-400/[0.07] text-red-300",
            ].join(
              " ",
            )}
          >
            {
              payment.status
            }
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          {payment.provider ===
          "PAYMONGO"
            ? "PayMongo"
            : "PayPal"}
          {" • "}
          {payment.paidAt
            ? `Paid ${formatSubscriptionDate(
                payment.paidAt,
              )}`
            : `Created ${formatSubscriptionDate(
                payment.createdAt,
              )}`}
        </p>
      </div>

      <div className="sm:text-right">
        {payment.periodStart &&
        payment.periodEnd ? (
          <>
            <div className="text-xs text-slate-400">
              Subscription period
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {formatSubscriptionDate(
                payment.periodStart,
              )}
              {" — "}
              {formatSubscriptionDate(
                payment.periodEnd,
              )}
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-600">
            No billing period
          </div>
        )}
      </div>
    </div>
  );
}