import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatNumber,
} from "@/utils/number";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationFinancialSummaryProps = {
  quotation: Quotation;
};

export function QuotationFinancialSummary({
  quotation,
}: QuotationFinancialSummaryProps) {
  const discountAmount =
    Number(
      quotation.discountAmount ??
        0,
    );

  const discountValue =
    Number(
      quotation.discountValue ??
        0,
    );

  const taxAmount =
    Number(
      quotation.taxAmount ?? 0,
    );

  const taxRate =
    Number(
      quotation.taxRate ?? 0,
    );

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-md rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-5 text-sm">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span className="font-medium text-slate-300">
              {formatCurrency(
                quotation.subtotal,
              )}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between gap-5 text-sm">
              <span className="text-slate-500">
                Discount
                {quotation.discountType ===
                  "PERCENTAGE" && (
                  <>
                    {" "}
                    (
                    {formatNumber(
                      discountValue,
                    )}
                    %)
                  </>
                )}
              </span>

              <span className="font-medium text-amber-300">
                -
                {formatCurrency(
                  discountAmount,
                )}
              </span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex items-center justify-between gap-5 text-sm">
              <span className="text-slate-500">
                Tax
                {taxRate > 0 && (
                  <>
                    {" "}
                    (
                    {formatNumber(
                      taxRate,
                    )}
                    %)
                  </>
                )}
              </span>

              <span className="font-medium text-slate-300">
                {formatCurrency(
                  taxAmount,
                )}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-5 border-t border-[var(--qufo-border)] pt-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-600">
              Total
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Final quoted amount
            </p>
          </div>

          <p className="text-2xl font-semibold text-emerald-300">
            {formatCurrency(
              quotation.total,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}