import {
  formatQuantity,
} from "@/utils/number";

import {
  formatWarranty,
} from "@/utils/warranty";

import type {
  JobItem,
} from "@/types/job";

type JobItemsListProps = {
  items?: JobItem[];
};

export function JobItemsList({
  items,
}: JobItemsListProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-medium text-slate-300">
        Job items
      </h3>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
        {items.map((item) => {
          const warranty =
            formatWarranty(
              item.warrantyDuration,
              item.warrantyUnit,
            );

          return (
            <div
              key={item.id}
              className="
                flex
                min-w-0
                flex-col
                gap-3
                border-b
                border-[var(--qufo-border)]
                px-4
                py-4
                last:border-0

                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:gap-4
                sm:px-5
              "
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {/* Item image */}
                {item.imageUrl && (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      size-14
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

                {/* Item details */}
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
                    <div className="mt-2">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-400">
                          Warranty:
                        </span>{" "}
                        {warranty}
                      </p>

                      {item.warrantyTerms && (
                        <p className="mt-1 max-w-xl break-words text-xs leading-5 text-slate-600">
                          {item.warrantyTerms}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <p className="shrink-0 text-sm text-slate-500">
                {formatQuantity(
                  item.quantity,
                )}{" "}
                {item.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}