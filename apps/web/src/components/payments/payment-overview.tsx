import {
  Banknote,
} from "lucide-react";

import {
  LoadingState,
} from "@/components/shared/loading-state";

import {
  TableHead,
} from "@/components/shared/table-head";

import {
  PaymentOverviewRow,
} from "@/components/payments/payment-overview-row";

import type {
  PaymentsSummaryResponse,
} from "@/types/payment";

type Props = {
  summary:
    | PaymentsSummaryResponse
    | null;

  loading: boolean;
};

export function PaymentOverview({
  summary,
  loading,
}: Props) {
  return (
    <div className="qufo-surface mb-5 overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--qufo-border)] px-5 py-4">
        <h2 className="text-sm font-medium text-slate-300">
          Payment Overview
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Current payment status
          and outstanding balance
          for each job.
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading payment overview..." />
      ) : !summary ||
        summary.items.length ===
          0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.05] text-emerald-300">
            <Banknote
              size={18}
            />
          </div>

          <p className="text-sm font-medium text-slate-400">
            No jobs available
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Jobs will appear here
            once quotations are
            converted into
            production jobs.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-[var(--qufo-border)]">
                <TableHead>
                  Job
                </TableHead>

                <TableHead>
                  Customer
                </TableHead>

                <TableHead>
                  Job Total
                </TableHead>

                <TableHead>
                  Paid
                </TableHead>

                <TableHead>
                  Balance
                </TableHead>

                <TableHead>
                  Payment Status
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {summary.items.map(
                (item) => (
                  <PaymentOverviewRow
                    key={item.id}
                    item={item}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}