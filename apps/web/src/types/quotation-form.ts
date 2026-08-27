export type QuotationDiscountType =
  | "NONE"
  | "FIXED"
  | "PERCENTAGE";

export type QuotationFormItem = {
  key: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  currency: string;
};

export type QuotationFormPayload = {
  customerId: string;

  validUntil?: string;

  discountType: QuotationDiscountType;
  discountValue: number;

  taxRate: number;

  notes?: string;
  terms?: string;

  items: {
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
};