import Link from "next/link";

import {
  Banknote,
} from "lucide-react";

import {
  PaymentStatusBadge,
} from "@/components/payments/payment-status-badge";

import {
  PAYMENT_METHOD_LABELS,
} from "@/constants/payment";

import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatDate,
} from "@/utils/date";

import type {
  DashboardRecentPayment,
} from "@/types/dashboard";

type DashboardRecentPaymentsProps = {
  payments:
    DashboardRecentPayment[];
};

export function DashboardRecentPayments({
  payments,
}: DashboardRecentPaymentsProps) {
  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-[var(--qufo-border)] px-5 py-4">
        <div>
          <h2 className="text-sm font-medium text-slate-300">
            Recent Payments
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Latest recorded collections.
          </p>
        </div>

        <Link
          href="/payments"
          className="text-xs text-cyan-300/70 transition hover:text-cyan-300"
        >
          View all
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
          <Banknote
            size={20}
            className="mb-3 text-slate-700"
          />

          <p className="text-sm text-slate-600">
            No payments yet
          </p>
        </div>
      ) : (
        <div>
          {payments.map(
            (payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-4 border-b border-[var(--qufo-border)] px-5 py-4 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300">
                    {
                      payment.paymentNumber
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {
                      PAYMENT_METHOD_LABELS[
                        payment.method
                      ]
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-700">
                    {formatDate(
                    payment.paidAt,
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <PaymentStatusBadge
                    status={
                      payment.status
                    }
                  />

                  <span className="text-xs font-medium text-emerald-300">
                    {formatCurrency(
                      payment.amount,
                      payment.currency
                    )}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}