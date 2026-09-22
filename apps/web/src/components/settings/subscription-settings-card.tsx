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

import { Button } from "@/components/ui/button";

import { formatSubscriptionDate } from "@/utils/subscription";

import type {
  SubscriptionBillingSummary,
  SubscriptionPaymentHistoryItem,
} from "@/types/subscription";

/*
 * import {
 *   AppSumoRedemptionCard,
 * } from "@/components/settings/appsumo-redemption-card";
 */

const SUBSCRIPTION_ENABLED =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== "false";

type SubscriptionSettingsCardProps = {
  billing: SubscriptionBillingSummary;

  payments: SubscriptionPaymentHistoryItem[];

  renewing: boolean;

  confirmingPayment: boolean;

  paymentResult: string | null;

  appSumoEnabled: boolean;
  redeemingAppSumo: boolean;

  appSumoSuccess: string | null;

  error: string | null;

  onRenew: () => Promise<void>;

  onRefresh: () => Promise<SubscriptionBillingSummary | null>;

  onRedeemAppSumo: (code: string) => Promise<boolean>;
};

export function SubscriptionSettingsCard({
  billing,
  payments,
  renewing,
  confirmingPayment,
  paymentResult,
  /*
   * appSumoEnabled,
   * redeemingAppSumo,
   * appSumoSuccess,
   */
  error,
  onRenew,
  onRefresh,
  // onRedeemAppSumo,
}: SubscriptionSettingsCardProps) {
  if (!SUBSCRIPTION_ENABLED) {
    return null;
  }

  const subscription = billing.subscription;

  const status = subscription.effectiveStatus ?? subscription.status;

  const lifetime =
    subscription.accessType === "LIFETIME" &&
    (subscription.source === "APPSUMO" || subscription.source === "DEALIFY");

  const isAppSumoLifetime =
    subscription.source === "APPSUMO" && subscription.accessType === "LIFETIME";

  const isDealifyLifetime =
    subscription.source === "DEALIFY" && subscription.accessType === "LIFETIME";

  const trialing = status === "TRIALING";

  const active = status === "ACTIVE";

  const daysRemaining = trialing
    ? billing.subscription.trialDaysRemaining
    : billing.subscription.daysRemaining;

  const phpBilling = billing.pricing.currency === "PHP";

  const price = new Intl.NumberFormat(phpBilling ? "en-PH" : "en-US", {
    style: "currency",
    currency: billing.pricing.currency,
    minimumFractionDigits: 2,
  }).format(Number(billing.pricing.amount));

  function formatSubscriptionStatus(currentStatus: string | null | undefined) {
    if (!currentStatus) {
      return "Unknown";
    }

    return currentStatus
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <div className="min-w-0 space-y-5">
      {/* =========================================================
          PAYMENT RESULT
      ========================================================= */}

      {paymentResult === "success" && (
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

      {paymentResult === "cancelled" && (
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />

            <div>
              <div className="text-sm font-medium text-amber-200">
                Checkout cancelled
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                No subscription payment was completed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN SUBSCRIPTION WORKSPACE
      ========================================================= */}

      <div className="qufo-surface min-w-0 overflow-hidden rounded-2xl">
        {/* Header */}

        <div className="flex items-center gap-3 border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
            <CreditCard size={18} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">Subscription</h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage your QUFO plan, billing and renewal.
            </p>
          </div>
        </div>

        {/* Desktop split */}

        <div className="grid min-w-0 gap-5 p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] lg:p-6">
          {/* =====================================================
              LEFT — CURRENT SUBSCRIPTION
          ===================================================== */}

          <div className="min-w-0 space-y-4">
            {/* Current plan */}

            <section className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.012] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
                    Current plan
                  </p>

                  <h3 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {isAppSumoLifetime
                      ? "QUFO Standard — AppSumo"
                      : isDealifyLifetime
                        ? "QUFO Standard — Dealify"
                        : "QUFO Standard"}
                  </h3>

                  <div className="mt-2">
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
                        active
                          ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300"
                          : trialing
                            ? "border-violet-400/15 bg-violet-400/[0.07] text-violet-300"
                            : "border-amber-400/15 bg-amber-400/[0.07] text-amber-300",
                      ].join(" ")}
                    >
                      {trialing
                        ? "Trial active"
                        : formatSubscriptionStatus(status)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
                    {lifetime ? "Access" : "Monthly"}
                  </p>

                  <p className="mt-1.5 text-xl font-semibold text-white">
                    {lifetime ? "Lifetime" : price}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {lifetime ? "No recurring payment" : "per month"}
                  </p>
                </div>
              </div>
            </section>

            {/* Dealify usage */}

            {isDealifyLifetime && billing.quotationUsage && (
              <section className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
                      Dealify usage
                    </p>

                    <h3 className="mt-1.5 text-base font-semibold text-white">
                      Monthly quotation credits
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      1 credit = 1 new quotation
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.08] px-3 py-2 text-right">
                    <div className="text-[10px] text-slate-500">Remaining</div>

                    <div className="text-lg font-semibold text-emerald-300">
                      {billing.quotationUsage.remaining.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {billing.quotationUsage.used.toLocaleString()} used
                    </span>

                    <span className="text-slate-500">
                      {billing.quotationUsage.limit.toLocaleString()} total
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-950/70">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{
                        width: `${
                          billing.quotationUsage.limit > 0
                            ? Math.min(
                                100,
                                (billing.quotationUsage.used /
                                  billing.quotationUsage.limit) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={13} />

                  <span>
                    Credits renew{" "}
                    {formatSubscriptionDate(billing.quotationUsage.resetsAt)}
                  </span>
                </div>

                {billing.quotationUsage.remaining === 0 && (
                  <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] px-3 py-2 text-xs leading-5 text-amber-300">
                    Your monthly quotation limit has been reached. New quotation
                    credits will be available when your monthly allowance
                    renews.
                  </div>
                )}
              </section>
            )}

            {/* Entitlements */}

            {isDealifyLifetime && billing.entitlements && (
              <section className="grid gap-3 sm:grid-cols-3">
                <Entitlement
                  label="Team members"
                  value={
                    billing.teamSeatUsage
                      ? `${billing.teamSeatUsage.usedSeats.toLocaleString()} of ${billing.teamSeatUsage.limit?.toLocaleString() ?? "—"} used`
                      : `Up to ${billing.entitlements.maxMembers.toLocaleString()} members`
                  }
                  detail={
                    billing.teamSeatUsage?.remainingSeats !== null &&
                    billing.teamSeatUsage?.remainingSeats !== undefined
                      ? `${billing.teamSeatUsage.remainingSeats.toLocaleString()} remaining`
                      : undefined
                  }
                />

                <Entitlement
                  label="Storage"
                  value={
                    billing.storageUsage
                      ? `${formatBytes(
                          billing.storageUsage.usedBytes,
                        )} of ${formatBytes(
                          billing.storageUsage.limitBytes,
                        )} used`
                      : `${formatBytes(
                          billing.entitlements.maxStorageBytes,
                        )} available`
                  }
                  detail={
                    billing.storageUsage
                      ? `${formatBytes(
                          billing.storageUsage.remainingBytes,
                        )} remaining`
                      : undefined
                  }
                />

                <Entitlement
                  label="Customer emails"
                  value={
                    billing.customerEmailUsage
                      ? `${billing.customerEmailUsage.used.toLocaleString()} of ${billing.customerEmailUsage.limit.toLocaleString()} used`
                      : `${billing.entitlements.monthlyCustomerEmailLimit.toLocaleString()}/month`
                  }
                  detail={
                    billing.customerEmailUsage
                      ? `${billing.customerEmailUsage.remaining.toLocaleString()} remaining this month`
                      : undefined
                  }
                />
              </section>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {lifetime ? (
                <DateCard
                  label="Lifetime access activated"
                  value={
                    isDealifyLifetime
                      ? subscription.dealifyActivatedAt
                      : subscription.appSumoActivatedAt
                  }
                />
              ) : trialing ? (
                <>
                  <DateCard
                    label="Trial started"
                    value={subscription.trialStartedAt}
                  />

                  <DateCard
                    label="Trial ends"
                    value={subscription.trialEndsAt}
                  />
                </>
              ) : active ? (
                <>
                  <DateCard
                    label="Paid period starts"
                    value={subscription.currentPeriodStart}
                  />

                  <DateCard
                    label="Active until"
                    value={subscription.currentPeriodEnd}
                  />
                </>
              ) : null}

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">
                <div className="flex gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-cyan-300"
                  />

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200">
                      QUFO Standard
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Access quotations, customers, jobs, payments, reports, and
                      customer tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Action bar */}

            <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">
                  {lifetime
                    ? "Lifetime access active"
                    : trialing
                      ? "Renew before your trial ends"
                      : active
                        ? "Extend your subscription"
                        : "Restore workspace access"}
                </p>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                  {lifetime
                    ? "No recurring subscription payment or renewal is required."
                    : trialing
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
                  disabled={confirmingPayment}
                  onClick={() => {
                    void onRefresh();
                  }}
                >
                  <RefreshCw size={16} />
                  Refresh
                </Button>

                {billing.canRenew && (
                  <Button
                    className="rounded-xl"
                    disabled={renewing || confirmingPayment}
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
                        <CreditCard size={16} />
                        Renew subscription
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — BILLING HISTORY
          ===================================================== */}

          <section className="min-w-0 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.012] overflow-hidden">
            <div className="border-b border-[var(--qufo-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-violet-400/[0.07] text-violet-300">
                  <CreditCard size={16} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Billing History
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Subscription payments and renewal history.
                  </p>
                </div>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <CreditCard size={24} className="text-slate-700" />

                <p className="mt-3 text-sm text-slate-400">
                  No subscription payments yet.
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">
                  Your completed renewals will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--qufo-border)]">
                {payments.map((payment) => (
                  <BillingHistoryRow key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function DateCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-[var(--qufo-border)] bg-white/[0.015] p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays size={14} />

        {label}
      </div>

      <div className="mt-2 text-sm font-medium text-slate-200">
        {formatSubscriptionDate(value)}
      </div>
    </div>
  );
}

function BillingHistoryRow({
  payment,
}: {
  payment: SubscriptionPaymentHistoryItem;
}) {
  const amount = new Intl.NumberFormat(
    payment.currency === "PHP" ? "en-PH" : "en-US",
    {
      style: "currency",
      currency: payment.currency,
      minimumFractionDigits: 2,
    },
  ).format(Number(payment.amount));

  const paid = payment.status === "PAID";

  const pending = payment.status === "PENDING";

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-200">{amount}</span>

            <span
              className={[
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",

                paid
                  ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300"
                  : pending
                    ? "border-amber-400/15 bg-amber-400/[0.07] text-amber-300"
                    : "border-red-400/15 bg-red-400/[0.07] text-red-300",
              ].join(" ")}
            >
              {payment.status}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {payment.provider === "PAYMONGO" ? "PayMongo" : "PayPal"}
            {" • "}
            {payment.paidAt
              ? `Paid ${formatSubscriptionDate(payment.paidAt)}`
              : `Created ${formatSubscriptionDate(payment.createdAt)}`}
          </p>
        </div>

        <CreditCard size={15} className="mt-1 shrink-0 text-slate-700" />
      </div>

      <div className="mt-3 rounded-xl bg-white/[0.015] px-3 py-2.5">
        {payment.periodStart && payment.periodEnd ? (
          <>
            <div className="text-[10px] uppercase tracking-wider text-slate-600">
              Subscription period
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {formatSubscriptionDate(payment.periodStart)}
              {" — "}
              {formatSubscriptionDate(payment.periodEnd)}
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-600">No billing period</div>
        )}
      </div>
    </div>
  );
}

function Entitlement({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-400/10 bg-slate-950/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-200">{value}</div>

      {detail && (
        <div className="mt-1 text-[11px] text-slate-500">{detail}</div>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** index;

  const formatted =
    index === 0 || value >= 10
      ? Math.round(value).toLocaleString()
      : value.toFixed(1);

  return `${formatted} ${units[index]}`;
}
