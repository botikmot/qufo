import {
  Plus,
} from "lucide-react";

import {
  QuotationFormItemRow,
} from "@/components/quotations/quotation-form-item-row";

import type {
  QuotationFormItem,
} from "@/types/quotation-form";

type QuotationFormItemsProps = {
  items: QuotationFormItem[];

  onAdd: () => void;

  onRemove: (
    key: string,
  ) => void;

  onChange: (
    key: string,
    patch: Partial<QuotationFormItem>,
  ) => void;
};

export function QuotationFormItems({
  items,
  onAdd,
  onRemove,
  onChange,
}: QuotationFormItemsProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-300">
            Quotation items
          </h3>

          <p className="mt-1 text-xs text-slate-600">
            Add products or
            services included
            in the quotation.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl border border-[var(--qufo-border)] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.04]"
        >
          <Plus size={14} />

          Add item
        </button>
      </div>

      <div className="space-y-3">
        {items.map(
          (item) => (
            <QuotationFormItemRow
              key={item.key}
              item={item}
              canRemove={
                items.length > 1
              }
              onChange={(
                patch,
              ) =>
                onChange(
                  item.key,
                  patch,
                )
              }
              onRemove={() =>
                onRemove(
                  item.key,
                )
              }
            />
          ),
        )}
      </div>
    </div>
  );
}