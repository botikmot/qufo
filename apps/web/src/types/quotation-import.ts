import type {
  QuotationDiscountType,
  WarrantyUnit,
} from "@/types/quotation-form";

export type QuotationImportFileType =
  | "xlsx"
  | "xls"
  | "csv"
  | "docx"
  | "pdf"
  | "image";

export type QuotationImportMethod =
  | "local"
  | "ocr"
  | "ai";

export type ImportedQuotationItem = {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;

  warrantyDuration?: number;
  warrantyUnit?: WarrantyUnit;
  warrantyTerms?: string;
};

export type ImportedQuotationCustomer = {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type ImportedQuotationDraft = {
  sourceFileName: string;
  sourceFileType: QuotationImportFileType;
  extractionMethod: QuotationImportMethod;

  customer: ImportedQuotationCustomer;

  subject?: string;
  validUntil?: string;

  items: ImportedQuotationItem[];

  discountType: QuotationDiscountType;
  discountValue: number;
  taxRate: number;

  notes?: string;
  terms?: string;

  warnings: string[];
};