import {
  StatCard,
} from "@/components/shared/stat-card";

import {
  formatCurrency,
} from "@/utils/currency";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardFinancialSummaryProps = {
  financials:
    DashboardResponse["stats"]["financials"];
};

export function DashboardFinancialSummary({
  financials,
}: DashboardFinancialSummaryProps) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-medium text-slate-300">
          Financial Overview
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Current job value,
          collections, and outstanding
          customer balances.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(
            financials.revenueThisMonth,
          )}
          variant="success"
        />

        <StatCard
          label="Total Job Value"
          value={formatCurrency(
            financials.totalJobValue,
          )}
        />

        <StatCard
          label="Total Collected"
          value={formatCurrency(
            financials.totalPaid,
          )}
          variant="success"
        />

        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(
            financials.outstandingBalance,
          )}
          variant={
            Number(
              financials.outstandingBalance,
            ) > 0
              ? "warning"
              : "default"
          }
        />
      </div>
    </div>
  );
}