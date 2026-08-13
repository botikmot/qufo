export type DashboardResponse = {
  organization: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };

  subscription: {
    plan: string | null;
    status: string | null;
    trialEndsAt: string | null;
    trialDaysRemaining: number | null;
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
    jobs: unknown[];
    quotations: unknown[];
    payments: unknown[];
  };
};