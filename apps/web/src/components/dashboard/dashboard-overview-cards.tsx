import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  Users,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import type { DashboardResponse } from "@/types/dashboard";

type DashboardOverviewCardsProps = {
  stats: DashboardResponse["stats"];
};

type OverviewCardProps = {
  label: string;
  value: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  accent: "cyan" | "green" | "yellow";
  trend?: string;
};

const accentStyles = {
  cyan: {
    border: "border-cyan-400/30",
    iconBg: "bg-cyan-400/[0.10]",
    iconColor: "text-cyan-300",
    value: "text-slate-100",
  },
  green: {
    border: "border-emerald-400/30",
    iconBg: "bg-emerald-400/[0.10]",
    iconColor: "text-emerald-300",
    value: "text-slate-100",
  },
  yellow: {
    border: "border-amber-400/30",
    iconBg: "bg-amber-400/[0.10]",
    iconColor: "text-amber-300",
    value: "text-slate-100",
  },
};

function OverviewCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
}: OverviewCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl",
        "border bg-[var(--qufo-surface)]",
        "p-4 sm:p-5",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:bg-white/[0.025]",
        styles.border,
      ].join(" ")}
    >
      {/* Subtle accent glow */}

      <div
        className={[
          "pointer-events-none absolute -right-10 -top-10",
          "size-28 rounded-full blur-3xl",
          accent === "green"
            ? "bg-emerald-400/[0.07]"
            : accent === "yellow"
              ? "bg-amber-400/[0.07]"
              : "bg-cyan-400/[0.07]",
        ].join(" ")}
      />

      <div className="relative flex items-center gap-3">
        {/* Icon */}

        <div
          className={[
            "flex size-12 shrink-0 items-center justify-center",
            "rounded-xl border border-white/[0.04]",
            styles.iconBg,
            styles.iconColor,
          ].join(" ")}
        >
          <Icon size={23} />
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {label}
          </p>

          <p
            className={[
              "mt-1 text-2xl font-semibold tracking-tight",
              styles.value,
            ].join(" ")}
          >
            {value}
          </p>

          {trend && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-300">
              <ArrowUpRight size={13} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Arrow */}

        <ChevronRight
          size={17}
          className="shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-300"
        />
      </div>
    </div>
  );
}

export function DashboardOverviewCards({ stats }: DashboardOverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      <OverviewCard
        label="Customers"
        value={String(stats.customers)}
        icon={Users}
        accent="cyan"
        trend="Your customer base"
      />

      <OverviewCard
        label="Open Quotations"
        value={String(stats.quotations.open)}
        icon={FileText}
        accent="cyan"
        trend="Awaiting customer response"
      />

      <OverviewCard
        label="Active Jobs"
        value={String(stats.jobs.active)}
        icon={BriefcaseBusiness}
        accent="green"
        trend="Production in progress"
      />

      <OverviewCard
        label="Overdue Jobs"
        value={String(stats.jobs.overdue)}
        icon={AlertTriangle}
        accent="yellow"
        trend={
          stats.jobs.overdue > 0
            ? "Needs your attention"
            : "Everything on track"
        }
      />
    </div>
  );
}
