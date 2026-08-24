import type {
  JobPriority,
  JobStatus,
} from "@/types/job";

import type {
  QuotationStatus,
} from "@/types/quotation";

import type {
  PaymentMethod,
  PaymentStatus,
} from "@/types/payment";

import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

export type DashboardCustomerSummary = {
  id: string;
  name: string;
  companyName: string | null;
};

export type DashboardRecentJob = {
  id: string;
  jobNumber: string;
  title: string;

  status: JobStatus;
  priority: JobPriority;

  dueDate: string | null;

  total: string;

  customer: DashboardCustomerSummary;
};

export type DashboardRecentQuotation = {
  id: string;

  quotationNumber: string;

  status: QuotationStatus;

  total: string;

  validUntil: string | null;

  customer: DashboardCustomerSummary;
};

export type DashboardRecentPayment = {
  id: string;

  paymentNumber: string;

  amount: string;

  method: PaymentMethod;
  status: PaymentStatus;

  paidAt: string;

  customer: DashboardCustomerSummary;

  job: {
    id: string;
    jobNumber: string;
  };
};

export type DashboardResponse = {
  organization: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };

  subscription: {
    plan:
      | SubscriptionPlan
      | null;

    status:
      | SubscriptionStatus
      | null;

    trialStartedAt:
      | string
      | null;

    trialEndsAt:
      | string
      | null;

    currentPeriodStart:
      | string
      | null;

    currentPeriodEnd:
      | string
      | null;

    trialDaysRemaining:
      | number
      | null;

    daysRemaining:
      | number
      | null;
  };

  stats: {
    customers: number;

    quotations: {
      open: number;
      approved: number;
    };

    jobs: {
      active: number;
      dueToday: number;
      overdue: number;
    };

    financials: {
      revenueThisMonth: string;
      totalJobValue: string;
      totalPaid: string;
      outstandingBalance: string;
    };
  };

  recent: {
    jobs: DashboardRecentJob[];
    quotations: DashboardRecentQuotation[];
    payments: DashboardRecentPayment[];
  };
};