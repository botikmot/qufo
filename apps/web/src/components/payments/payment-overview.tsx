import { Banknote } from "lucide-react";

import { LoadingState } from "@/components/shared/loading-state";

import { Pagination } from "@/components/shared/pagination";

import { TableHead } from "@/components/shared/table-head";

import { PaymentOverviewRow } from "@/components/payments/payment-overview-row";

import type { PaymentsSummaryResponse } from "@/types/payment";

type Props = {
  summary: PaymentsSummaryResponse | null;

  loading: boolean;

  embedded?: boolean;

  onPrevious?: () => Promise<void>;

  onNext?: () => Promise<void>;
};

export function PaymentOverview({
  summary,
  loading,
  embedded = false,
  onPrevious,
  onNext,
}: Props) {
  const page = summary?.pagination.page ?? 1;

  const pages = summary?.pagination.pages ?? 1;

  const total = summary?.pagination.total ?? 0;

  const items = summary?.items ?? [];

  const firstItem = total === 0 ? 0 : (page - 1) * 10 + 1;

  const lastItem =
    total === 0 ? 0 : Math.min(firstItem + items.length - 1, total);

  return (
    <div
      className={
        embedded
          ? "overflow-hidden"
          : "qufo-surface overflow-hidden rounded-2xl"
      }
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="border-b border-[var(--qufo-border)] px-4 py-4 sm:px-5">
        <h2 className="text-sm font-medium text-slate-300">Payment Overview</h2>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Current payment status and outstanding balance for each job.
        </p>
      </div>

      {/* =========================================================
          LOADING
      ========================================================= */}

      {loading ? (
        <LoadingState label="Loading payment overview..." />
      ) : items.length === 0 ? (
        /* =======================================================
           EMPTY
        ======================================================= */

        <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.05] text-emerald-300">
            <Banknote size={18} />
          </div>

          <p className="text-sm font-medium text-slate-400">
            No jobs available
          </p>

          <p className="mt-1 max-w-sm text-xs text-slate-600">
            Jobs will appear here once quotations are converted into production
            jobs.
          </p>
        </div>
      ) : (
        /* =======================================================
           CONTENT
        ======================================================= */

        <>
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--qufo-border)]">
                  <TableHead>
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Job
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Customer
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Job Total
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Paid
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Balance
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Payment Status
                    </span>
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <PaymentOverviewRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 sm:text-sm">
              Showing{" "}
              <span className="font-medium text-slate-300">{firstItem}</span>
              {"–"}
              <span className="font-medium text-slate-300">{lastItem}</span>
              {" of "}
              <span className="font-medium text-slate-300">{total}</span>
              {" jobs"}
            </p>

            <Pagination
              page={page}
              pages={pages}
              loading={loading}
              onPrevious={() => {
                if (onPrevious) {
                  void onPrevious();
                }
              }}
              onNext={() => {
                if (onNext) {
                  void onNext();
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
