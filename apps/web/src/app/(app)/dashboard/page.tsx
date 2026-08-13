"use client";

import {
  useEffect,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";

import type {
  DashboardResponse,
} from "@/types/dashboard";

import {
  AlertTriangle,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  FileText,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";

export default function DashboardPage() {
  
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data =
          await apiFetch<DashboardResponse>(
            "/dashboard",
          );

        setDashboard(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading QUFO...
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  if(error){
    console.log(error)
  }

  
  return (
  <>
    <PageHeader
      title="Dashboard"
      description="A live overview of your business workflow."
    />

    {dashboard.subscription.status ===
      "TRIALING" && (
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-5 py-4">
        <div>
          <p className="text-sm font-medium text-emerald-300">
            QUFO Standard Trial
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {
              dashboard.subscription
                .trialDaysRemaining
            }{" "}
            days remaining in your
            free trial.
          </p>
        </div>

        <div className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 sm:block">
          TRIALING
        </div>
      </div>
    )}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStat
        title="Customers"
        value={
          dashboard.stats.customers
        }
        subtitle="Active customers"
        icon={Users}
      />

      <DashboardStat
        title="Open Quotations"
        value={
          dashboard.stats
            .quotations.open
        }
        subtitle={`${dashboard.stats.quotations.approved} approved`}
        icon={FileText}
      />

      <DashboardStat
        title="Active Jobs"
        value={
          dashboard.stats.jobs.active
        }
        subtitle={`${dashboard.stats.jobs.dueToday} due today`}
        icon={BriefcaseBusiness}
      />

      <DashboardStat
        title="Overdue"
        value={
          dashboard.stats.jobs.overdue
        }
        subtitle="Require attention"
        icon={AlertTriangle}
        attention={
          dashboard.stats.jobs.overdue >
          0
        }
      />
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      <FinancialCard
        title="Revenue this month"
        value={
          dashboard.stats.financials
            .revenueThisMonth
        }
        icon={CircleDollarSign}
      />

      <FinancialCard
        title="Total collected"
        value={
          dashboard.stats.financials
            .totalPaid
        }
        icon={CircleDollarSign}
      />

      <FinancialCard
        title="Outstanding balance"
        value={
          dashboard.stats.financials
            .outstandingBalance
        }
        icon={Clock3}
      />
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-3">
      <div className="qufo-surface rounded-2xl p-5 xl:col-span-2">
        <div className="mb-5">
          <h2 className="font-medium text-zinc-200">
            Workflow pulse
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            Current activity across your
            QUFO workspace.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniMetric
            label="Due today"
            value={
              dashboard.stats.jobs
                .dueToday
            }
          />

          <MiniMetric
            label="Approved quotes"
            value={
              dashboard.stats
                .quotations.approved
            }
          />

          <MiniMetric
            label="Active jobs"
            value={
              dashboard.stats.jobs
                .active
            }
          />
        </div>
      </div>

      <div className="qufo-surface relative overflow-hidden rounded-2xl p-5">
        
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-emerald-500/5 blur-3xl" />

        <p className="relative text-sm font-medium text-zinc-200">
          System status
        </p>

        <div className="relative mt-6 flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />

            <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
          </span>

          <div>
            <p className="text-sm text-zinc-300">
              All systems operational
            </p>

            <p className="text-xs text-zinc-600">
              Workflow engine connected
            </p>
          </div>
        </div>
      </div>
    </section>
  </>
);
}

import type {
  LucideIcon,
} from "lucide-react";

function DashboardStat({
  title,
  value,
  subtitle,
  icon: Icon,
  attention = false,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  attention?: boolean;
}) {
  return (
    <div className="qufo-surface qufo-surface-hover group rounded-2xl p-5">
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div
          className={[
            "flex size-10 items-center justify-center rounded-xl",
            attention
              ? "bg-red-500/10 text-red-400"
              : "bg-emerald-500/[0.07] text-emerald-400",
          ].join(" ")}
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        {subtitle}
      </p>
    </div>
  );
}

function FinancialCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="qufo-surface rounded-2xl p-5">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon
          size={16}
          strokeWidth={1.8}
        />

        <p className="text-sm">
          {title}
        </p>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-[#081421] p-4">
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function formatCurrency(
  value: string,
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
    },
  ).format(Number(value));
}