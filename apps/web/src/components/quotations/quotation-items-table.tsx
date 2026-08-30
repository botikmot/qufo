import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatQuantity,
} from "@/utils/number";

import {
  formatWarranty,
} from "@/utils/warranty";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationItemsTableProps = {
  items: Quotation["items"];
  currency: string;
};

export function QuotationItemsTable({
  items,
  currency,
}: QuotationItemsTableProps) {
  if (!items?.length) {
    return null;
  }

  console.log('items::', items)

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
          (item, index) => {
            const warranty =
              formatWarranty(
                item.warrantyDuration,
                item.warrantyUnit,
              );

            return (
              <div
                key={
                  item.id ??
                  `${item.name}-${item.sortOrder ?? index}`
                }
                className="
                  rounded-2xl
                  border
                  border-[var(--qufo-border)]
                  bg-black/10
                  p-4
                "
              >
                <div className="flex items-start gap-3">
                  {item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        h-16
                        w-16
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        border
                        border-[var(--qufo-border)]
                        bg-black/20
                      "
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    </a>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-slate-300">
                      {item.name}
                    </p>

                    {item.description && (
                      <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                        {item.description}
                      </p>
                    )}

                    {warranty && (
                      <div
                        className="
                          mt-3
                          rounded-xl
                          border
                          border-[var(--qufo-border)]
                          bg-white/[0.02]
                          px-3
                          py-2
                        "
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                          Warranty
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {warranty}
                        </p>

                        {item.warrantyTerms && (
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {item.warrantyTerms}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
                        currency,
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
                      currency,
                    )}
                  </span>
                </div>
              </div>
            );
          },
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
              (item, index) => {
                const warranty =
                  formatWarranty(
                    item.warrantyDuration,
                    item.warrantyUnit,
                  );

                return (
                  <tr
                    key={
                      item.id ??
                      `${item.name}-${item.sortOrder ?? index}`
                    }
                    className="border-b border-[var(--qufo-border)] last:border-0"
                  >
                    <td className="min-w-0 px-5 py-4">
                      <div className="flex items-start gap-3">
                        {item.imageUrl && (
                          <a
                            href={item.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="
                              h-14
                              w-14
                              shrink-0
                              overflow-hidden
                              rounded-xl
                              border
                              border-[var(--qufo-border)]
                              bg-black/20
                            "
                          >
                            <img
                              src={
                                item.imageUrl
                              }
                              alt={item.name}
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />
                          </a>
                        )}

                        <div className="min-w-0">
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

                          {warranty && (
                            <div className="mt-2">
                              <p className="text-xs text-slate-500">
                                <span className="font-medium text-slate-400">
                                  Warranty:
                                </span>{" "}
                                {warranty}
                              </p>

                              {item.warrantyTerms && (
                                <p className="mt-1 max-w-lg text-xs leading-5 text-slate-600">
                                  {
                                    item.warrantyTerms
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
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
                        currency,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-300">
                      {formatCurrency(
                        item.total,
                        currency,
                      )}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}