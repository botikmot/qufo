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

  onImageSelect: (
    key: string,
    file: File,
  ) => void | Promise<void>;

  uploadingImageKey?: string | null;

  currency: string;
};

export function QuotationFormItems({
  items,
  onAdd,
  onRemove,
  onChange,
  onImageSelect,
  uploadingImageKey,
  currency,
}: QuotationFormItemsProps) {
  return (
    <div className="min-w-0">
      <div
        className="
          mb-4
          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-slate-300">
            Quotation items
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Add products or services included in the quotation.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="
            flex
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-[var(--qufo-border)]
            px-3
            py-2.5
            text-xs
            text-slate-300
            transition
            hover:bg-white/[0.04]

            sm:w-auto
          "
        >
          <Plus size={14} />

          Add item
        </button>
      </div>

      <div className="min-w-0 space-y-3">
        {items.map((item) => (
          <QuotationFormItemRow
            key={item.key}
            item={item}
            canRemove={
              items.length > 1
            }
            onChange={(patch) =>
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
            onImageSelect={(file) =>
              onImageSelect(
                item.key,
                file,
              )
            }
            isUploadingImage={
              uploadingImageKey ===
              item.key
            }
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}