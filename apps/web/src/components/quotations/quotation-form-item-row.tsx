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
    <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-4">
      <div className="grid gap-4 lg:grid-cols-[2fr_0.7fr_0.7fr_1fr_auto]">
        <div>
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

        <div>
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

        <div>
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

        <div>
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

        <div className="flex items-end">
          <button
            type="button"
            onClick={onRemove}
            disabled={
              !canRemove
            }
            className="flex size-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-red-400/[0.07] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-20"
          >
            <Trash2
              size={16}
            />
          </button>
        </div>
      </div>

      <div className="mt-4">
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

      <div className="mt-3 flex justify-end">
        <p className="text-sm text-slate-500">
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