"use client";

import {
  RefreshCw,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/app/page-header";

import {
  DashboardBusinessStatus,
} from "@/components/dashboard/dashboard-business-status";

import {
  DashboardFinancialSummary,
} from "@/components/dashboard/dashboard-financial-summary";

import {
  DashboardOverviewCards,
} from "@/components/dashboard/dashboard-overview-cards";

import {
  DashboardRecentActivity,
} from "@/components/dashboard/dashboard-recent-activity";

import {
  LoadingState,
} from "@/components/shared/loading-state";

import {
  useDashboard,
} from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const dashboard =
    useDashboard();

  if (
    dashboard.loading &&
    !dashboard.dashboard
  ) {
    return (
      <LoadingState label="Loading dashboard..." />
    );
  }

  if (!dashboard.dashboard) {
    return (
      <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
        {dashboard.error ??
          "Unable to load dashboard."}
      </div>
    );
  }

  const data =
    dashboard.dashboard;


  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${data.organization.name} business overview and workflow status.`}
        action={
          <button
            type="button"
            disabled={
              dashboard.refreshing
            }
            onClick={() =>
              void dashboard.refresh()
            }
            className="flex items-center gap-2 rounded-xl border border-[var(--qufo-border)] px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                dashboard.refreshing
                  ? "animate-spin"
                  : undefined
              }
            />

            {dashboard.refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        }
      />

      {dashboard.error && (
        <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {dashboard.error}
        </div>
      )}

      <div className="space-y-7">
        <DashboardOverviewCards
          stats={data.stats}
        />

        <DashboardFinancialSummary
          financials={
            data.stats.financials
          }
        />

        <DashboardBusinessStatus
          stats={data.stats}
          subscription={
            data.subscription
          }
        />

        

        <DashboardRecentActivity
          recent={data.recent}
        />
      </div>
    </>
  );
}