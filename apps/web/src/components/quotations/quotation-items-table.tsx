import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatQuantity,
} from "@/utils/number";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationItemsTableProps = {
  items: Quotation["items"];
};

export function QuotationItemsTable({
  items,
}: QuotationItemsTableProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="min-w-0">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-slate-300">
          Quotation items
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Products and services included
          in this quotation.
        </p>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {items.map(
          (item, index) => (
            <div
              key={`${item.name}-${item.sortOrder ?? index}`}
              className="
                rounded-2xl
                border
                border-[var(--qufo-border)]
                bg-black/10
                p-4
              "
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-slate-300">
                  {item.name}
                </p>

                {item.description && (
                  <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--qufo-border)] pt-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                    Quantity
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatQuantity(
                      item.quantity,
                    )}{" "}
                    {item.unit}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                    Unit price
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatCurrency(
                      item.unitPrice,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--qufo-border)] pt-4">
                <span className="text-xs text-slate-600">
                  Line total
                </span>

                <span className="text-sm font-semibold text-slate-200">
                  {formatCurrency(
                    item.total,
                  )}
                </span>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Desktop / tablet */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--qufo-border)] md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--qufo-border)] bg-black/10">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                Item
              </th>

              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                Qty
              </th>

              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                Unit Price
              </th>

              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map(
              (item, index) => (
                <tr
                  key={`${item.name}-${item.sortOrder ?? index}`}
                  className="border-b border-[var(--qufo-border)] last:border-0"
                >
                  <td className="min-w-0 px-5 py-4">
                    <p className="break-words text-sm font-medium text-slate-300">
                      {item.name}
                    </p>

                    {item.description && (
                      <p className="mt-1 max-w-lg break-words text-xs leading-5 text-slate-600">
                        {
                          item.description
                        }
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-500">
                    {formatQuantity(
                      item.quantity,
                    )}{" "}
                    {item.unit}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-500">
                    {formatCurrency(
                      item.unitPrice,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-300">
                    {formatCurrency(
                      item.total,
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}