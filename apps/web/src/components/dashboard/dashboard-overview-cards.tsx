import {
  StatCard,
} from "@/components/shared/stat-card";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardOverviewCardsProps = {
  stats: DashboardResponse["stats"];
};

export function DashboardOverviewCards({
  stats,
}: DashboardOverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Customers"
        value={String(
          stats.customers,
        )}
      />

      <StatCard
        label="Open Quotations"
        value={String(
          stats.quotations.open,
        )}
      />

      <StatCard
        label="Active Jobs"
        value={String(
          stats.jobs.active,
        )}
        variant="success"
      />

      <StatCard
        label="Overdue Jobs"
        value={String(
          stats.jobs.overdue,
        )}
        variant={
          stats.jobs.overdue > 0
            ? "danger"
            : "default"
        }
      />
    </div>
  );
}