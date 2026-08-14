import type {
  QuotationDiscountType,
  QuotationFormItem,
} from "@/types/quotation-form";

export function calculateQuotationItemTotal(
  item: QuotationFormItem,
) {
  const quantity =
    Number(item.quantity);

  const unitPrice =
    Number(item.unitPrice);

  if (
    !Number.isFinite(quantity) ||
    !Number.isFinite(unitPrice)
  ) {
    return 0;
  }

  return quantity * unitPrice;
}

export function calculateQuotationSubtotal(
  items: QuotationFormItem[],
) {
  return items.reduce(
    (total, item) =>
      total +
      calculateQuotationItemTotal(
        item,
      ),
    0,
  );
}

export function calculateQuotationDiscount(
  subtotal: number,
  discountType: QuotationDiscountType,
  discountValue: number,
) {
  if (
    discountType === "NONE" ||
    discountValue <= 0
  ) {
    return 0;
  }

  if (
    discountType ===
    "PERCENTAGE"
  ) {
    return Math.min(
      subtotal *
        (discountValue / 100),
      subtotal,
    );
  }

  return Math.min(
    discountValue,
    subtotal,
  );
}

export function calculateQuotationTax(
  taxableAmount: number,
  taxRate: number,
) {
  if (
    taxableAmount <= 0 ||
    taxRate <= 0
  ) {
    return 0;
  }

  return (
    taxableAmount *
    (taxRate / 100)
  );
}

export function calculateQuotationTotals(
  items: QuotationFormItem[],
  discountType: QuotationDiscountType,
  discountValue: number,
  taxRate: number,
) {
  const subtotal =
    calculateQuotationSubtotal(
      items,
    );

  const discountAmount =
    calculateQuotationDiscount(
      subtotal,
      discountType,
      discountValue,
    );

  const taxableAmount =
    Math.max(
      subtotal -
        discountAmount,
      0,
    );

  const taxAmount =
    calculateQuotationTax(
      taxableAmount,
      taxRate,
    );

  const total =
    taxableAmount +
    taxAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
}