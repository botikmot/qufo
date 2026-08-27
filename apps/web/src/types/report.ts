export type ReportQuotationStatus = {
  status: string;

  _count: {
    _all: number;
  };

  _sum: {
    total: string | null;
  };
};

export type ReportJobStatus = {
  status: string;

  _count: {
    _all: number;
  };

  _sum: {
    total: string | null;
  };
};

export type ReportPaymentMethod = {
  method: string;
  _count: {
    _all: number;
  };

  _sum: {
    amount: string | null;
  };
};

export type ReportTopCustomer = {
  id: string;
  name: string;
  companyName: string | null;

  jobCount: number;

  totalValue: string;
  currency: string;
};

export type ReportData = {
  period: {
    from: string;
    to: string;
  };

  overview: {
    currency: string;
    customers: number;
    quotations: number;
    jobs: number;
    paymentCount: number;

    totalJobValue: string;
    totalPaid: string;
    outstandingBalance: string;
  };

  quotations: {
    total: number;
    approved: number;
    rejected: number;
    converted: number;
    conversionRate: number;

    byStatus: ReportQuotationStatus[];
  };

  jobs: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    completionRate: number;

    byStatus: ReportJobStatus[];
  };

  payments: {
    count: number;
    collected: string;
    currency: string;
    byMethod: ReportPaymentMethod[];
    
  };

  topCustomers: ReportTopCustomer[];
};