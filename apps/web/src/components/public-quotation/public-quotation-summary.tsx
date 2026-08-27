import {
  formatCurrency,
} from "@/utils/currency";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationSummaryProps = {
  quotation:
    PublicQuotation;
  currency: string;
};

export function PublicQuotationSummary({
  quotation,
  currency
}: PublicQuotationSummaryProps) {
  const numberFormatter =
    new Intl.NumberFormat(
      "en-PH",
      {
        maximumFractionDigits: 2,
      },
    );

  return (
    <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
      <h2 className="mb-5 text-sm font-medium text-slate-300">
        Summary
      </h2>

      <div className="flex items-center justify-between gap-4 py-2 text-sm">
        <span className="text-slate-500">
          Subtotal
        </span>

        <span className="text-slate-300">
          {formatCurrency(
            quotation.subtotal,
            currency
          )}
        </span>
      </div>

      {Number(
        quotation.discountAmount,
      ) > 0 && (
        <div className="flex items-center justify-between gap-4 py-2 text-sm">
          <span className="text-slate-500">
            {quotation.discountType ===
            "PERCENTAGE"
              ? `Discount (${numberFormatter.format(
                  Number(
                    quotation.discountValue,
                  ),
                )}%)`
              : "Discount"}
          </span>

          <span className="text-slate-300">
            -{" "}
            {formatCurrency(
              quotation.discountAmount,
              currency
            )}
          </span>
        </div>
      )}

      {Number(
        quotation.taxAmount,
      ) > 0 && (
        <div className="flex items-center justify-between gap-4 py-2 text-sm">
          <span className="text-slate-500">
            Tax (
            {numberFormatter.format(
              Number(
                quotation.taxRate,
              ),
            )}
            %)
          </span>

          <span className="text-slate-300">
            {formatCurrency(
              quotation.taxAmount,
              currency
            )}
          </span>
        </div>
      )}

      <div className="mt-5 border-t border-[var(--qufo-border)] pt-5">
        <div className="flex items-end justify-between gap-4">
          <span className="text-sm text-slate-400">
            Total
          </span>

          <span className="text-2xl font-semibold tracking-tight text-emerald-300">
            {formatCurrency(
              quotation.total,
              currency
            )}
          </span>
        </div>
      </div>
    </div>
  );
}