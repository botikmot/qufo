"use client";

import {
  useEffect,
  useRef,
} from "react";

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
  const lastItemRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const previousItemCount =
    useRef(
      items.length,
    );

  useEffect(() => {
    const itemAdded =
      items.length >
      previousItemCount.current;

    previousItemCount.current =
      items.length;

    if (!itemAdded) {
      return;
    }

    requestAnimationFrame(
      () => {
        lastItemRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "center",
          },
        );
      },
    );
  }, [items.length]);

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-4 min-w-0">
        <h3 className="text-sm font-medium text-slate-300">
          Quotation items
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Add products or services included in the quotation.
        </p>
      </div>

      {/* Items */}
      <div className="min-w-0 space-y-3">
        {items.map(
          (
            item,
            index,
          ) => {
            const isLast =
              index ===
              items.length -
                1;

            return (
              <div
                key={
                  item.key
                }
                ref={
                  isLast
                    ? lastItemRef
                    : undefined
                }
              >
                <QuotationFormItemRow
                  item={
                    item
                  }
                  canRemove={
                    items.length >
                    1
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
                  onImageSelect={(
                    file,
                  ) =>
                    onImageSelect(
                      item.key,
                      file,
                    )
                  }
                  isUploadingImage={
                    uploadingImageKey ===
                    item.key
                  }
                  currency={
                    currency
                  }
                />
              </div>
            );
          },
        )}
      </div>

      {/* Add another item */}
      <button
        type="button"
        onClick={onAdd}
        className="
          cursor-pointer
          mt-3
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-emerald-400/30
          bg-emerald-400/[0.07]
          px-4
          py-3
          text-xs
          font-medium
          text-emerald-300
          shadow-[0_0_0_1px_rgba(52,211,153,0.03)]
          transition-all
          duration-200

          hover:border-emerald-400/50
          hover:bg-emerald-400/[0.12]
          hover:text-emerald-200
          hover:shadow-[0_0_22px_rgba(52,211,153,0.08)]

          active:scale-[0.995]
        "
      >
        <Plus
          size={15}
          strokeWidth={2}
        />

        Add another item
      </button>
    </div>
  );
}