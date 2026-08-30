import {
  ImagePlus,
  ShieldCheck,
  Trash2,
  X,
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

  onImageSelect: (
    file: File,
  ) => void | Promise<void>;

  isUploadingImage?: boolean;

  currency: string;
};

export function QuotationFormItemRow({
  item,
  canRemove,
  onChange,
  onRemove,
  onImageSelect,
  isUploadingImage = false,
  currency,
}: QuotationFormItemRowProps) {
  const total =
    calculateQuotationItemTotal(
      item,
    );

  const hasWarranty = Boolean(
    item.warrantyDuration ||
      item.warrantyUnit ||
      item.warrantyTerms?.trim(),
  );

  function handleWarrantyToggle(
    enabled: boolean,
  ) {
    if (enabled) {
      onChange({
        warrantyDuration: "",
        warrantyUnit: "MONTHS",
        warrantyTerms: "",
      });

      return;
    }

    onChange({
      warrantyDuration: "",
      warrantyUnit: "",
      warrantyTerms: "",
    });
  }

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
                  event.target.value,
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
            value={item.quantity}
            onChange={(event) =>
              onChange({
                quantity:
                  event.target.value,
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
                  event.target.value,
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
            value={item.unitPrice}
            onChange={(event) =>
              onChange({
                unitPrice:
                  event.target.value,
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
            disabled={!canRemove}
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
            <Trash2 size={16} />
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
          value={item.description}
          onChange={(event) =>
            onChange({
              description:
                event.target.value,
            })
          }
          className="qufo-input resize-none"
          placeholder="Optional description..."
        />
      </div>

      {/* Optional details */}
      <div
        className="
          mt-4
          grid
          gap-4

          lg:grid-cols-2
        "
      >
        {/* Image */}
        <div
          className="
            rounded-2xl
            border
            border-[var(--qufo-border)]
            bg-white/[0.015]
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                size-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--qufo-border)]
                bg-black/10
                text-slate-500
              "
            >
              <ImagePlus size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-400">
                Item image
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Optional product, design, or reference image.
              </p>
            </div>
          </div>

          {item.imageUrl ? (
            <div className="mt-4 flex items-center gap-3">
              <div
                role="img"
                aria-label={item.name || "Quotation item image"}
                className="
                  size-20
                  shrink-0
                  rounded-xl
                  border
                  border-[var(--qufo-border)]
                  bg-cover
                  bg-center
                  bg-no-repeat
                "
                style={{
                  backgroundImage:
                    `url("${item.imageUrl}")`,
                }}
              />

              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                <label
                  className="
                    inline-flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[var(--qufo-border)]
                    bg-white/[0.025]
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-slate-400
                    transition
                    hover:bg-white/[0.05]
                    hover:text-slate-300
                  "
                >
                  <ImagePlus size={14} />

                  {isUploadingImage
                    ? "Uploading..."
                    : "Replace"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingImage}
                    className="hidden"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0];

                      if (file) {
                        void onImageSelect(file);
                      }

                      event.target.value = "";
                    }}
                  />
                </label>

                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() =>
                    onChange({
                      imageUrl: "",
                      imageKey: "",
                    })
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-slate-600
                    transition
                    hover:bg-red-400/[0.07]
                    hover:text-red-300
                    disabled:pointer-events-none
                    disabled:opacity-40
                  "
                >
                  <X size={14} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              className="
                mt-4
                flex
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-dashed
                border-[var(--qufo-border)]
                px-4
                py-4
                text-xs
                font-medium
                text-slate-500
                transition
                hover:border-[var(--qufo-border-strong)]
                hover:bg-white/[0.02]
                hover:text-slate-400
              "
            >
              <ImagePlus size={15} />

              {isUploadingImage
                ? "Uploading image..."
                : "Upload image"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploadingImage}
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (file) {
                    void onImageSelect(file);
                  }

                  event.target.value = "";
                }}
              />
            </label>
          )}

          <p className="mt-2 text-[11px] text-slate-700">
            JPG, PNG or WEBP. Maximum 5 MB.
          </p>
        </div>

        {/* Warranty */}
        <div
          className="
            rounded-2xl
            border
            border-[var(--qufo-border)]
            bg-white/[0.015]
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                size-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--qufo-border)]
                bg-black/10
                text-slate-500
              "
            >
              <ShieldCheck size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-400">
                Warranty
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Add warranty coverage for this item.
              </p>
            </div>

            <label className="flex shrink-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={hasWarranty}
                onChange={(event) =>
                  handleWarrantyToggle(
                    event.target.checked,
                  )
                }
                className="size-4 accent-emerald-400"
              />

              <span className="text-xs text-slate-500">
                Add
              </span>
            </label>
          </div>

          {hasWarranty && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs text-slate-500">
                    Duration
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      item.warrantyDuration
                    }
                    onChange={(event) =>
                      onChange({
                        warrantyDuration:
                          event.target.value,
                      })
                    }
                    className="qufo-input"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs text-slate-500">
                    Period
                  </label>

                  <select
                    value={
                      item.warrantyUnit
                    }
                    onChange={(event) =>
                      onChange({
                        warrantyUnit:
                          event.target
                            .value as QuotationFormItem["warrantyUnit"],
                      })
                    }
                    className="qufo-input"
                  >
                    <option value="DAYS">
                      Days
                    </option>

                    <option value="WEEKS">
                      Weeks
                    </option>

                    <option value="MONTHS">
                      Months
                    </option>

                    <option value="YEARS">
                      Years
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-500">
                  Warranty terms
                </label>

                <textarea
                  rows={2}
                  value={
                    item.warrantyTerms
                  }
                  onChange={(event) =>
                    onChange({
                      warrantyTerms:
                        event.target.value,
                    })
                  }
                  className="qufo-input resize-none"
                  placeholder="Optional coverage details, exclusions, or conditions..."
                />
              </div>
            </div>
          )}
        </div>
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
          disabled={!canRemove}
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
          <Trash2 size={15} />
        </button>

        <p className="min-w-0 text-right text-sm text-slate-500">
          Line total:{" "}
          <span className="font-medium text-slate-300">
            {formatCurrency(
              total,
              currency,
            )}
          </span>
        </p>
      </div>
    </div>
  );
}