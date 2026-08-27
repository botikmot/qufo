import {
  formatCurrency,
} from "@/utils/currency";

import type {
  ReportTopCustomer,
} from "@/types/report";

type ReportsTopCustomersProps = {
  customers:
    ReportTopCustomer[];
};

export function ReportsTopCustomers({
  customers,
}: ReportsTopCustomersProps) {
  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--qufo-border)] px-5 py-4">
        <h2 className="text-sm font-medium text-white">
          Top customers
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Customers ranked by
          job value in this
          period.
        </p>
      </div>

      {customers.length >
      0 ? (
        <div className="divide-y divide-[var(--qufo-border)]">
          {customers.map(
            (
              customer,
              index,
            ) => (
              <div
                key={
                  customer.id
                }
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-medium text-slate-500">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-200">
                    {customer.companyName ??
                      customer.name}
                  </div>

                  {customer.companyName && (
                    <div className="mt-1 truncate text-xs text-slate-600">
                      {
                        customer.name
                      }
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-300">
                    {formatCurrency(
                      Number(
                        customer.totalValue,
                      ),
                      customer.currency
                    )}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    {
                      customer.jobCount
                    }{" "}
                    job
                    {customer.jobCount !==
                    1
                      ? "s"
                      : ""}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="px-5 py-10 text-center text-sm text-slate-600">
          No customer activity
          during this period.
        </div>
      )}
    </div>
  );
}