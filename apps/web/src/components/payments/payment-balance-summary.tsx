import {
  PaymentSummaryStatus,
} from "@/components/payments/payment-summary-status";

import {
  formatCurrency,
} from "@/utils/currency";

import type {
  JobPaymentStatus,
} from "@/types/payment";

type PaymentBalanceSummaryProps = {
  total: number;
  paidAmount: number;
  balance: number;

  status:
    JobPaymentStatus;

  loading?: boolean;
};

export function PaymentBalanceSummary({
  total,
  paidAmount,
  balance,
  status,
  loading = false,
}: PaymentBalanceSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Job Total
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-300">
            {formatCurrency(
              total,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Paid
          </p>

          <p className="mt-2 text-lg font-semibold text-emerald-300">
            {loading
              ? "Loading..."
              : formatCurrency(
                  paidAmount,
                )}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Balance
          </p>

          <p className="mt-2 text-lg font-semibold text-amber-300">
            {loading
              ? "Loading..."
              : formatCurrency(
                  balance,
                )}
          </p>
        </div>
      </div>

      {!loading && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--qufo-border)] bg-black/10 px-4 py-3">
          <span className="text-xs text-slate-500">
            Payment status
          </span>

          <PaymentSummaryStatus
            status={status}
          />
        </div>
      )}
    </div>
  );
}