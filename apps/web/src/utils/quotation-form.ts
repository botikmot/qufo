import type {
  QuotationFormItem,
} from "@/types/quotation-form";

export function createQuotationFormItem(): QuotationFormItem {
  return {
    key: crypto.randomUUID(),
    name: "",
    description: "",
    quantity: "1",
    unit: "pc",
    unitPrice: "",
  };
}