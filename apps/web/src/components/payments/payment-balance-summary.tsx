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
  currency: string;
};

export function PaymentBalanceSummary({
  total,
  paidAmount,
  balance,
  status,
  loading = false,
  currency
}: PaymentBalanceSummaryProps) {
  return (
    <div className="min-w-0 space-y-3">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Job Total
          </p>

          <p className="mt-2 break-words text-lg font-semibold text-slate-300">
            {formatCurrency(
              total,
              currency
            )}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Paid
          </p>

          <p className="mt-2 break-words text-lg font-semibold text-emerald-300">
            {loading
              ? "Loading..."
              : formatCurrency(
                  paidAmount,
                  currency
                )}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Balance
          </p>

          <p className="mt-2 break-words text-lg font-semibold text-amber-300">
            {loading
              ? "Loading..."
              : formatCurrency(
                  balance,
                  currency
                )}
          </p>
        </div>
      </div>

      {!loading && (
        <div
          className="
            flex
            min-w-0
            flex-col
            gap-2
            rounded-xl
            border
            border-[var(--qufo-border)]
            bg-black/10
            px-4
            py-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span className="text-xs text-slate-500">
            Payment status
          </span>

          <div className="min-w-0">
            <PaymentSummaryStatus
              status={status}
            />
          </div>
        </div>
      )}
    </div>
  );
}