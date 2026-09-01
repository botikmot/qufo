export type QuotationPdfItem = {
  id: string;

  name: string;

  description:
    | string
    | null;

  quantity: number;

  unit: string;

  unitPrice: number;

  total: number;

  imageUrl?: string | null;
  imageKey?: string | null;

  warrantyDuration?: number | null;

  warrantyUnit?:
    | "DAYS"
    | "WEEKS"
    | "MONTHS"
    | "YEARS"
    | null;

  warrantyTerms?: string | null;

};

export type QuotationPdfData = {
  quotationNumber: string;

  revisionNumber: number;

  issueDate: string;

  validUntil:
    | string
    | null;

  currency: string;

  business: {
    name: string;

    logoUrl:
      | string
      | null;

    address:
      | string
      | null;

    email:
      | string
      | null;

    phone:
      | string
      | null;
  };

  customer: {
    name: string;

    companyName:
      | string
      | null;

    address:
      | string
      | null;

    email:
      | string
      | null;

    phone:
      | string
      | null;
  };

  items:
    QuotationPdfItem[];

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  total: number;

  notes:
    | string
    | null;

  terms:
    | string
    | null;

  footerNote:
    | string
    | null;

  preparedBy: string;

  authorizedSignatureUrl:
  string | null;

  authorizedSignatoryName:
    string | null;

  authorizedSignatoryTitle:
    string | null;

  showQuotationSignature:
    boolean;
};