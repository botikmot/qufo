import {
  formatCurrency,
} from "@/utils/currency";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationItemsProps = {
  items:
    PublicQuotation["items"];
};

export function PublicQuotationItems({
  items,
}: PublicQuotationItemsProps) {
  const quantityFormatter =
    new Intl.NumberFormat(
      "en-PH",
      {
        maximumFractionDigits: 3,
      },
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
      <div className="hidden grid-cols-[1fr_100px_120px_140px] border-b border-[var(--qufo-border)] bg-white/[0.02] px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-slate-600 sm:grid">
        <span>
          Item
        </span>

        <span>
          Quantity
        </span>

        <span>
          Unit Price
        </span>

        <span className="text-right">
          Total
        </span>
      </div>

      <div>
        {items.map(
          (item) => (
            <div
              key={
                item.id
              }
              className="border-b border-[var(--qufo-border)] p-5 last:border-0 sm:grid sm:grid-cols-[1fr_100px_120px_140px] sm:items-center"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {
                    item.name
                  }
                </p>

                {item.description && (
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
                    {
                      item.description
                    }
                  </p>
                )}
              </div>

              <div className="mt-3 text-sm text-slate-400 sm:mt-0">
                {quantityFormatter.format(
                  Number(
                    item.quantity,
                  ),
                )}{" "}
                {item.unit}
              </div>

              <div className="mt-2 text-sm text-slate-400 sm:mt-0">
                {formatCurrency(
                  item.unitPrice,
                )}
              </div>

              <div className="mt-2 text-sm font-medium text-slate-200 sm:mt-0 sm:text-right">
                {formatCurrency(
                  item.total,
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}