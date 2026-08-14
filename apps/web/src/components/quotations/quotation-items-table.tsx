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
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-slate-300">
          Quotation items
        </h3>

        <p className="mt-1 text-xs text-slate-600">
          Products and services included
          in this quotation.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
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
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-300">
                        {item.name}
                      </p>

                      {item.description && (
                        <p className="mt-1 max-w-lg text-xs leading-5 text-slate-600">
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-500">
                      {formatQuantity(
                        item.quantity,
                      )}{" "}
                      {item.unit}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-500">
                      {formatCurrency(
                        item.unitPrice,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-300">
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
    </div>
  );
}