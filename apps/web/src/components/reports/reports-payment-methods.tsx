import {
  formatCurrency,
} from "@/utils/currency";

import type {
  ReportData,
} from "@/types/report";

type ReportsPaymentMethodsProps = {
  payments:
    ReportData["payments"];
};

function formatMethod(
  value: string,
) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export function ReportsPaymentMethods({
  payments,
}: ReportsPaymentMethodsProps) {
  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--qufo-border)] px-5 py-4">
        <h2 className="text-sm font-medium text-white">
          Payment methods
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Collections received
          during the selected
          period.
        </p>
      </div>

      {payments.byMethod.length >
      0 ? (
        <div className="divide-y divide-[var(--qufo-border)]">
          {payments.byMethod.map(
            (item) => (
              <div
                key={
                  item.method
                }
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <div className="text-sm text-slate-300">
                    {formatMethod(
                      item.method,
                    )}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    {
                      item
                        ._count
                        ._all
                    }{" "}
                    payment
                    {item._count
                      ._all !==
                    1
                      ? "s"
                      : ""}
                  </div>
                </div>

                <div className="text-sm font-medium text-emerald-300">
                  {formatCurrency(
                    Number(
                      item
                        ._sum
                        .amount ??
                        0,
                    ),
                    payments.currency
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="px-5 py-10 text-center text-sm text-slate-600">
          No paid payments
          during this period.
        </div>
      )}
    </div>
  );
}