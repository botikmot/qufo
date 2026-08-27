import {
  formatCurrency,
} from "@/utils/currency";

type QuotationFormSummaryProps = {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
};

export function QuotationFormSummary({
  subtotal,
  discountAmount,
  taxAmount,
  total,
  currency,
}: QuotationFormSummaryProps) {
  return (
    <div className="flex justify-end">
      <div className="w-full max-w-md rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-5">
            <span className="text-slate-500">
              Subtotal
            </span>

            <span className="text-slate-300">
              {formatCurrency(
                subtotal,
                currency
              )}
            </span>
          </div>

          {discountAmount >
            0 && (
            <div className="flex justify-between gap-5">
              <span className="text-slate-500">
                Discount
              </span>

              <span className="text-amber-300">
                -
                {formatCurrency(
                  discountAmount,
                  currency
                )}
              </span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between gap-5">
              <span className="text-slate-500">
                Tax
              </span>

              <span className="text-slate-300">
                {formatCurrency(
                  taxAmount,
                  currency
                )}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[var(--qufo-border)] pt-5">
          <span className="text-sm font-medium text-slate-300">
            Total
          </span>

          <span className="text-2xl font-semibold text-emerald-300">
            {formatCurrency(
              total,
              currency
            )}
          </span>
        </div>
      </div>
    </div>
  );
}