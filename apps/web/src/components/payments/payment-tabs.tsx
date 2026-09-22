"use client";

import { CreditCard, ListChecks } from "lucide-react";

import { useState } from "react";

import { PaymentOverview } from "@/components/payments/payment-overview";

import { PaymentTransactions } from "@/components/payments/payment-transactions";

import type {
  Payment,
  PaymentStatus,
  PaymentsSummaryResponse,
} from "@/types/payment";

type Props = {
  summary: PaymentsSummaryResponse | null;

  payments: Payment[];

  loading: boolean;

  paymentsLoading: boolean;

  overviewLoading: boolean;

  canVoid: boolean;

  voidingId: string | null;

  paymentPage: number;

  paymentPages: number;

  paymentTotal: number;

  paymentSearch: string;

  paymentStatus: "ALL" | PaymentStatus;

  onSearch: (value: string) => Promise<void>;

  onStatusChange: (status: "ALL" | PaymentStatus) => Promise<void>;

  onPrevious: () => Promise<void>;

  onNext: () => Promise<void>;

  onOverviewPrevious: () => Promise<void>;

  onOverviewNext: () => Promise<void>;

  onVoid: (payment: Payment) => Promise<void>;
};

type Tab = "overview" | "transactions";

export function PaymentTabs({
  summary,
  payments,
  loading,
  paymentsLoading,
  overviewLoading,
  canVoid,
  voidingId,
  paymentPage,
  paymentPages,
  paymentTotal,
  paymentSearch,
  paymentStatus,
  onSearch,
  onStatusChange,
  onPrevious,
  onNext,
  onOverviewPrevious,
  onOverviewNext,
  onVoid,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("transactions");

  return (
    <section className="qufo-surface min-w-0 overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
      {/* HEADER */}

      <div className="border-b border-[var(--qufo-border)] px-5 pt-4 sm:px-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Payment Activity
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Review payment balances and transaction history.
          </p>
        </div>

        {/* TABS */}

        <div className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={[
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition",
              activeTab === "transactions"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-500 hover:text-slate-300",
            ].join(" ")}
          >
            <CreditCard size={15} />
            Payment Transactions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={[
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition",
              activeTab === "overview"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-500 hover:text-slate-300",
            ].join(" ")}
          >
            <ListChecks size={15} />
            Payment Overview
          </button>
        </div>
      </div>

      {/* CONTENT */}

      <div className="min-w-0">
        {activeTab === "overview" ? (
          <PaymentOverview
            summary={summary}
            loading={loading || overviewLoading}
            embedded
            onPrevious={onOverviewPrevious}
            onNext={onOverviewNext}
          />
        ) : (
          <PaymentTransactions
            payments={payments}
            loading={loading}
            paymentsLoading={paymentsLoading}

            canVoid={canVoid}
            voidingId={voidingId}
            onVoid={onVoid}

            page={paymentPage}
            pages={paymentPages}
            total={paymentTotal}

            search={paymentSearch}
            statusFilter={paymentStatus}

            onSearch={onSearch}
            onStatusChange={onStatusChange}

            onPrevious={onPrevious}
            onNext={onNext}

            embedded
          />
        )}
      </div>
    </section>
  );
}
