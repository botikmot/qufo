export type PaymentMethod =
  | "CASH"
  | "GCASH"
  | "MAYA"
  | "BANK_TRANSFER"
  | "CARD"
  | "CHECK"
  | "OTHER";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "VOIDED";

export type Payment = {
  id: string;

  paymentNumber: string;

  amount: string;

  method: PaymentMethod;
  status: PaymentStatus;

  referenceNumber: string | null;
  notes: string | null;

  paidAt: string | null;

  createdAt: string;
  updatedAt?: string;

  customer?: {
    id: string;
    name: string;
    companyName: string | null;
  };

  job?: {
    id: string;
    jobNumber: string;
    title: string;
    total: string;
  };
};

export type PaymentsResponse = {
  items: Payment[];

  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type JobPaymentsResponse =
  | Payment[]
  | {
      items: Payment[];
      payments?: Payment[];

      summary?: {
        total?: string;
        paidAmount?: string;
        balance?: string;
        paymentStatus?: string;
      };
    };

export type PaymentFormData = {
  jobId: string;
  amount: string;
  method: PaymentMethod;
  referenceNumber: string;
  notes: string;
};

export type JobPaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID";

export type JobPaymentSummary = {
  id: string;

  jobNumber: string;
  title: string;

  jobStatus: string;

  customer: {
    id: string;
    name: string;
    companyName: string | null;
  };

  total: string;
  paidAmount: string;
  balance: string;

  paymentStatus:
    JobPaymentStatus;
};

export type PaymentsSummaryResponse = {
  summary: {
    totalJobValue: string;
    totalPaid: string;
    totalBalance: string;
  };

  items: JobPaymentSummary[];
};