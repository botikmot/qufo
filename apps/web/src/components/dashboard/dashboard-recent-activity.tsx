import {
  DashboardRecentJobs,
} from "@/components/dashboard/dashboard-recent-jobs";

import {
  DashboardRecentPayments,
} from "@/components/dashboard/dashboard-recent-payments";

import {
  DashboardRecentQuotations,
} from "@/components/dashboard/dashboard-recent-quotations";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardRecentActivityProps = {
  recent: DashboardResponse["recent"];
};

export function DashboardRecentActivity({
  recent,
}: DashboardRecentActivityProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-medium text-slate-300">
          Recent Activity
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Latest activity across your
          QUFO workflow.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <DashboardRecentJobs
          jobs={recent.jobs}
        />

        <DashboardRecentQuotations
          quotations={
            recent.quotations
          }
        />

        <DashboardRecentPayments
          payments={
            recent.payments
          }
        />
      </div>
    </section>
  );
}