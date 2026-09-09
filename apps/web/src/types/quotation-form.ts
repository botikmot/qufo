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

  imageUrl: string;
  imageKey: string;

  warrantyDuration: string;
  warrantyUnit: WarrantyUnit | "";
  warrantyTerms: string;
  
  currency: string;
};

export type QuotationFormPayload = {
  customerId: string;

  businessProfileId?: string | null;

  validUntil?: string;

  discountType: QuotationDiscountType;
  discountValue: number;

  taxRate: number;

  subject?: string;

  notes?: string;
  terms?: string;

  imageUrl?: string;
  imageKey?: string;

  warrantyDuration?: number;

  warrantyUnit?:
    | "DAYS"
    | "WEEKS"
    | "MONTHS"
    | "YEARS";

  warrantyTerms?: string;

  items: {
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
};

export type WarrantyUnit =
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";