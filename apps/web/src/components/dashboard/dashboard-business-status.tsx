import {
  DashboardSubscriptionCard,
} from "@/components/dashboard/dashboard-subscription-card";

import {
  DashboardWorkflowSummary,
} from "@/components/dashboard/dashboard-workflow-summary";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardBusinessStatusProps = {
  stats: DashboardResponse["stats"];

  subscription:
    DashboardResponse["subscription"];
};

export function DashboardBusinessStatus({
  stats,
  subscription,
}: DashboardBusinessStatusProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <DashboardWorkflowSummary
        stats={stats}
      />

      <DashboardSubscriptionCard
        subscription={
          subscription
        }
      />
    </div>
  );
}