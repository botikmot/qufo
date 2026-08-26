import {
  Trash2,
} from "lucide-react";

import {
  formatCurrency,
} from "@/utils/currency";

import {
  calculateQuotationItemTotal,
} from "@/utils/quotation-calculation";

import type {
  QuotationFormItem,
} from "@/types/quotation-form";

type QuotationFormItemRowProps = {
  item: QuotationFormItem;

  canRemove: boolean;

  onChange: (
    patch: Partial<QuotationFormItem>,
  ) => void;

  onRemove: () => void;
};

export function QuotationFormItemRow({
  item,
  canRemove,
  onChange,
  onRemove,
}: QuotationFormItemRowProps) {
  const total =
    calculateQuotationItemTotal(
      item,
    );

  return (
    <div
      className="
        min-w-0
        rounded-2xl
        border
        border-[var(--qufo-border)]
        bg-black/10
        p-4
      "
    >
      <div
        className="
          grid
          min-w-0
          grid-cols-1
          gap-4

          sm:grid-cols-2

          lg:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)_auto]
        "
      >
        {/* Item */}
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label className="mb-2 block text-xs text-slate-500">
            Item / Service
          </label>

          <input
            value={item.name}
            onChange={(event) =>
              onChange({
                name:
                  event.target
                    .value,
              })
            }
            className="qufo-input"
            placeholder="Tarpaulin printing"
          />
        </div>

        {/* Quantity */}
        <div className="min-w-0">
          <label className="mb-2 block text-xs text-slate-500">
            Quantity
          </label>

          <input
            type="number"
            min="0.001"
            step="0.001"
            value={
              item.quantity
            }
            onChange={(event) =>
              onChange({
                quantity:
                  event.target
                    .value,
              })
            }
            className="qufo-input"
          />
        </div>

        {/* Unit */}
        <div className="min-w-0">
          <label className="mb-2 block text-xs text-slate-500">
            Unit
          </label>

          <input
            value={item.unit}
            onChange={(event) =>
              onChange({
                unit:
                  event.target
                    .value,
              })
            }
            className="qufo-input"
            placeholder="pc"
          />
        </div>

        {/* Unit price */}
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label className="mb-2 block text-xs text-slate-500">
            Unit price
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={
              item.unitPrice
            }
            onChange={(event) =>
              onChange({
                unitPrice:
                  event.target
                    .value,
              })
            }
            className="qufo-input"
            placeholder="0.00"
          />
        </div>

        {/* Desktop remove */}
        <div className="hidden items-end lg:flex">
          <button
            type="button"
            onClick={onRemove}
            disabled={
              !canRemove
            }
            title="Remove item"
            aria-label="Remove quotation item"
            className="
              flex
              size-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-600
              transition
              hover:bg-red-400/[0.07]
              hover:text-red-300
              disabled:cursor-not-allowed
              disabled:opacity-20
            "
          >
            <Trash2
              size={16}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 min-w-0">
        <label className="mb-2 block text-xs text-slate-500">
          Description
        </label>

        <textarea
          rows={2}
          value={
            item.description
          }
          onChange={(event) =>
            onChange({
              description:
                event.target
                  .value,
            })
          }
          className="qufo-input resize-none"
          placeholder="Optional description..."
        />
      </div>

      {/* Footer */}
      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-[var(--qufo-border)]
          pt-3

          lg:justify-end
          lg:border-0
          lg:pt-0
        "
      >
        {/* Mobile / tablet remove */}
        <button
          type="button"
          onClick={onRemove}
          disabled={
            !canRemove
          }
          title="Remove item"
          aria-label="Remove quotation item"
          className="
            flex
            size-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-slate-600
            transition
            hover:bg-red-400/[0.07]
            hover:text-red-300
            disabled:cursor-not-allowed
            disabled:opacity-20

            lg:hidden
          "
        >
          <Trash2
            size={15}
          />
        </button>

        <p className="min-w-0 text-right text-sm text-slate-500">
          Line total:{" "}
          <span className="font-medium text-slate-300">
            {formatCurrency(
              total,
            )}
          </span>
        </p>
      </div>
    </div>
  );
}