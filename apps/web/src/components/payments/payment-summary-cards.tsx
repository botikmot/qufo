import {
  StatCard,
} from "@/components/shared/stat-card";

import {
  formatCurrency,
} from "@/utils/currency";

import type {
  PaymentsSummaryResponse,
} from "@/types/payment";

type Props = {
  summary:
    | PaymentsSummaryResponse
    | null;
};

export function PaymentSummaryCards({
  summary,
}: Props) {
  const totalJobValue =
    Number(
      summary?.summary
        .totalJobValue ?? 0,
    );

  const totalPaid =
    Number(
      summary?.summary
        .totalPaid ?? 0,
    );

  const totalBalance =
    Number(
      summary?.summary
        .totalBalance ?? 0,
    );

  const currency = summary?.summary.currency ?? 'PHP'

  return (
    <div className="mb-5 grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total Job Value"
        value={formatCurrency(
          totalJobValue,
          currency
        )}
      />

      <StatCard
        label="Total Collected"
        value={formatCurrency(
          totalPaid,
          currency
        )}
        variant="success"
      />

      <StatCard
        label="Outstanding Balance"
        value={formatCurrency(
          totalBalance,
          currency
        )}
        variant={
          totalBalance > 0
            ? "warning"
            : "default"
        }
      />
    </div>
  );
}