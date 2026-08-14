import {
  formatQuantity,
} from "@/utils/number";

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
    <div>
      <h3 className="mb-3 text-sm font-medium text-slate-300">
        Job items
      </h3>

      <div className="overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
        {items.map(
          (item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 border-b border-[var(--qufo-border)] px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {item.name}
                </p>

                {item.description && (
                  <p className="mt-1 text-xs text-slate-600">
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