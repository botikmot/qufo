"use client";

import { CreditCard, Plus } from "lucide-react";

import { PaymentFormModal } from "@/components/payments/payment-form-modal";

import { PaymentSummaryCards } from "@/components/payments/payment-summary-cards";

import { PaymentTabs } from "@/components/payments/payment-tabs";

import { useAuthSession } from "@/lib/auth-storage";

import { usePayments } from "@/hooks/use-payments";

import { canVoidPayment } from "@/utils/payment-permission";

import { useWorkspaceAccess } from "@/hooks/use-workspace-access";

export default function PaymentsPage() {
  const session = useAuthSession();

  const payments = usePayments();

  const canVoid = canVoidPayment(session?.organization.role);

  const { readOnly } = useWorkspaceAccess();

  return (
    <div className="min-w-0 space-y-6 pb-6">
      {/* =========================================================
          PAYMENT HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#07192B]">
        {/* Ambient glow */}

        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.04] blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-blue-500/[0.04] blur-3xl"
          aria-hidden="true"
        />

        {/* Decorative waves */}

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            className="absolute right-0 top-0 h-full w-3/4"
            fill="none"
          >
            <path
              d="M0 120 C120 20 200 30 320 105 S520 175 650 70 S820 15 1040 70"
              stroke="#06B6D4"
              strokeWidth="1"
              opacity="0.5"
            />

            <path
              d="M0 145 C140 65 230 50 370 125 S570 170 710 90 S850 40 1040 95"
              stroke="#0E7490"
              strokeWidth="0.8"
              opacity="0.45"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          {/* Title */}

          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/70">
              Payment Management
            </p>

            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                <CreditCard size={22} strokeWidth={1.7} />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Payments
              </h1>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Track customer payments, balances, and payment transactions across
              your workspace.
            </p>
          </div>

          {/* Record payment */}

          <button
            type="button"
            disabled={readOnly}
            onClick={payments.openPaymentForm}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus
              size={17}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            Record payment
          </button>
        </div>
      </section>

      {/* =========================================================
          PAYMENT SUMMARY
      ========================================================= */}

      <PaymentSummaryCards summary={payments.summary} />

      {/* =========================================================
          ERROR
      ========================================================= */}

      {payments.error && (
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {payments.error}
        </div>
      )}

      {/* =========================================================
          PAYMENT ACTIVITY TABS
      ========================================================= */}

      <PaymentTabs
        summary={payments.summary}
        payments={payments.payments}

        loading={payments.loading}

        paymentsLoading={payments.paymentsLoading}

        overviewLoading={payments.overviewLoading}

        canVoid={canVoid}

        voidingId={payments.voidingId}

        paymentPage={payments.paymentPage}

        paymentPages={payments.paymentPages}

        paymentTotal={payments.paymentTotal}

        paymentSearch={payments.paymentSearch}

        paymentStatus={payments.paymentStatus}

        onSearch={payments.searchPayments}

        onStatusChange={payments.changePaymentStatus}

        onPrevious={payments.previousPaymentPage}

        onNext={payments.nextPaymentPage}

        onOverviewPrevious={payments.previousOverviewPage}

        onOverviewNext={payments.nextOverviewPage}

        onVoid={payments.voidPayment}
      />

      {/* =========================================================
          PAYMENT FORM
      ========================================================= */}

      {payments.showPaymentForm && (
        <PaymentFormModal
          jobs={payments.jobs}
          loading={payments.saving}
          onClose={payments.closePaymentForm}
          onSubmit={payments.recordPayment}
        />
      )}
    </div>
  );
}
