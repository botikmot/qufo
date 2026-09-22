import { DashboardSubscriptionCard } from "@/components/dashboard/dashboard-subscription-card";

import { DashboardWorkflowSummary } from "@/components/dashboard/dashboard-workflow-summary";

import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";

import type { DashboardResponse } from "@/types/dashboard";

type DashboardBusinessStatusProps = {
  stats: DashboardResponse["stats"];

  subscription: DashboardResponse["subscription"];

  recent: DashboardResponse["recent"];
};

export function DashboardBusinessStatus({
  stats,
  subscription,
  recent,
}: DashboardBusinessStatusProps) {
  return (
    <div className="grid min-w-0 gap-5">
      {/* Workflow */}

      <div className="min-w-0">
        <DashboardWorkflowSummary stats={stats} />
      </div>

      {/* Recent Activity + Subscription */}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <DashboardRecentActivity activity={recent.activity} />
        </div>

        <div className="min-w-0">
          <DashboardSubscriptionCard subscription={subscription} />
        </div>
      </div>
    </div>
  );
}
