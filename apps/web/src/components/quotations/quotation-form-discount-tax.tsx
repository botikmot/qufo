import type {
  QuotationDiscountType,
} from "@/types/quotation-form";

type QuotationFormDiscountTaxProps = {
  discountType:
    QuotationDiscountType;

  discountValue: string;
  taxRate: string;

  onDiscountTypeChange: (
    value:
      QuotationDiscountType,
  ) => void;

  onDiscountValueChange: (
    value: string,
  ) => void;

  onTaxRateChange: (
    value: string,
  ) => void;
};

export function QuotationFormDiscountTax({
  discountType,
  discountValue,
  taxRate,
  onDiscountTypeChange,
  onDiscountValueChange,
  onTaxRateChange,
}: QuotationFormDiscountTaxProps) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Discount
        </label>

        <select
          value={discountType}
          onChange={(event) =>
            onDiscountTypeChange(
              event.target
                .value as QuotationDiscountType,
            )
          }
          className="qufo-input"
        >
          <option value="NONE">
            No discount
          </option>

          <option value="FIXED">
            Fixed amount
          </option>

          <option value="PERCENTAGE">
            Percentage
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Discount value
        </label>

        <input
          type="number"
          min="0"
          max={
            discountType ===
            "PERCENTAGE"
              ? 100
              : undefined
          }
          step="0.01"
          disabled={
            discountType ===
            "NONE"
          }
          value={
            discountValue
          }
          onChange={(event) =>
            onDiscountValueChange(
              event.target.value,
            )
          }
          className="qufo-input disabled:opacity-40"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-400">
          Tax rate (%)
        </label>

        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={taxRate}
          onChange={(event) =>
            onTaxRateChange(
              event.target.value,
            )
          }
          className="qufo-input"
        />
      </div>
    </div>
  );
}