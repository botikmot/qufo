import {
  formatQuantity,
} from "@/utils/number";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobItemsProps = {
  items:
    PublicJob["items"];
};

export function PublicJobItems({
  items,
}: PublicJobItemsProps) {
  if (
    items.length === 0
  ) {
    return null;
  }

  return (
    <div className="border-t border-[var(--qufo-border)] p-6 sm:p-8">
      <h2 className="mb-4 text-sm font-medium text-slate-300">
        Order items
      </h2>

      <div className="overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
        {items.map(
          (
            item,
            index,
          ) => (
            <div
              key={`${item.name}-${index}`}
              className="flex flex-col gap-2 border-b border-[var(--qufo-border)] px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {item.name}
                </p>

                {item.description && (
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {
                      item.description
                    }
                  </p>
                )}
              </div>

              <p className="text-sm text-slate-500">
                {formatQuantity(
                  item.quantity,
                )}{" "}
                {item.unit}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}