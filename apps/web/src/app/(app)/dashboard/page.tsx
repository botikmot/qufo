"use client";

import { DashboardBusinessStatus } from "@/components/dashboard/dashboard-business-status";

import { DashboardFinancialSummary } from "@/components/dashboard/dashboard-financial-summary";

import { DashboardOverviewCards } from "@/components/dashboard/dashboard-overview-cards";

//import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";

import { LoadingState } from "@/components/shared/loading-state";

import { useDashboard } from "@/hooks/use-dashboard";

import { DashboardWelcomeHero } from "@/components/dashboard/dashboard-welcome-hero";

export default function DashboardPage() {
  const dashboard = useDashboard();

  if (dashboard.loading && !dashboard.dashboard) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (!dashboard.dashboard) {
    return (
      <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
        {dashboard.error ?? "Unable to load dashboard."}
      </div>
    );
  }

  const data = dashboard.dashboard;

  return (
    <div className="relative min-w-0 space-y-6 pb-6">
      {/* ========================================
          WELCOME HERO
      ======================================== */}

      <DashboardWelcomeHero
        organizationName={data.organization.name}
        refreshing={dashboard.refreshing}
        onRefresh={() => void dashboard.refresh()}
      />

      {/* ========================================
          ERROR
      ======================================== */}

      {dashboard.error && (
        <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {dashboard.error}
        </div>
      )}

      {/* ========================================
          KPI CARDS
      ======================================== */}

      <DashboardOverviewCards stats={data.stats} />

      {/* ========================================
          FINANCIAL + WORKFLOW
      ======================================== */}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.08fr_1fr]">
        <DashboardFinancialSummary financials={data.stats.financials} />

        <DashboardBusinessStatus
          stats={data.stats}
          subscription={data.subscription}
          recent={data.recent}
        />
      </div>

      {/* ========================================
          RECENT ACTIVITY
      ======================================== */}

      {/* <DashboardRecentActivity recent={data.recent} /> */}

      {/* ========================================
          FOOTER MOTTO
      ======================================== */}

      <div className="flex items-center justify-end gap-3 px-2">
        <div className="h-px w-10 bg-cyan-400/70" />

        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">
          Keep the momentum going.
        </p>
      </div>
    </div>
  );
}
