export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED"
  | "CANCELLED";

export type DiscountType =
  | "NONE"
  | "FIXED"
  | "PERCENTAGE";

export type QuotationCustomer = {
  id: string;
  name: string;
  companyName: string | null;
  email?: string | null;
  phone?: string | null;
};

export type QuotationItem = {
  id?: string;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: string;
  sortOrder?: number;
};

export type Quotation = {
  id: string;

  quotationNumber: string;
  status: QuotationStatus;

  issueDate: string;
  validUntil: string | null;

  subtotal: string;

  discountType?: DiscountType;
  discountValue?: string;
  discountAmount: string;

  revisionNumber?: number;
  sourceQuotationId?: string | null;

  customerResponseNote?: string | null;
  changesRequestedAt?: string | null;
  rejectedAt?: string | null;

  taxRate?: string;
  taxAmount: string;

  total: string;

  notes?: string | null;
  terms?: string | null;

  customer: QuotationCustomer;

  items?: QuotationItem[];

  _count?: {
    items: number;
  };

  revisionInfo?: QuotationRevisionInfo;

  createdAt?: string;
  updatedAt?: string;
};

export type QuotationsResponse = {
  items: Quotation[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type QuotationFormItem = {
  name: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

export type QuotationFormData = {
  customerId: string;
  validUntil: string;

  discountType: DiscountType;
  discountValue: string;

  taxRate: string;

  notes: string;
  terms: string;

  items: QuotationFormItem[];
};

export type PublicQuotation = {
  quotationNumber: string;
  status: QuotationStatus;

  revisionInfo: PublicQuotationRevisionInfo;

  issueDate: string;
  validUntil: string | null;

  organization: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };

  customer: {
    name: string;
    companyName: string | null;
  };

  items: {
    id: string;
    name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unitPrice: string;
    total: string;
    sortOrder: number;
  }[];

  subtotal: string;

  discountType: DiscountType;
  discountValue: string;
  discountAmount: string;

  taxRate: string;
  taxAmount: string;

  total: string;

  notes: string | null;
  terms: string | null;

  customerResponseNote:
    | string
    | null;
};

export type PublicQuotationResponse = {
  message: string;

  quotation: {
    quotationNumber: string;

    status:
      | "APPROVED"
      | "REJECTED"
      | "CHANGES_REQUESTED";

    approvedAt?: string;
    rejectedAt?: string;
    changesRequestedAt?: string;

    customerResponseNote?:
      | string
      | null;
  };
};

export type QuotationRevisionInfo = {
  isLatest: boolean;
  latestQuotationId: string;
  latestQuotationNumber: string;
  latestRevisionNumber: number;
};

export type PublicQuotationRevisionInfo = {
  isLatest: boolean;
  latestQuotationNumber: string;
  latestRevisionNumber: number;
};