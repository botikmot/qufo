import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  FileText,
  Flag,
  Workflow,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { DashboardResponse } from "@/types/dashboard";

type DashboardWorkflowSummaryProps = {
  stats: DashboardResponse["stats"];
};

type WorkflowStageProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  badge?: string;
  subtitle?: string;
};

const workflowStages: {
  label: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}[] = [
  {
    label: "Quotations",
    icon: FileText,
    color: "border-purple-400",
    iconColor: "text-purple-300",
  },
  {
    label: "For Approval",
    icon: CheckCircle2,
    color: "border-cyan-400",
    iconColor: "text-cyan-300",
  },
  {
    label: "In Progress",
    icon: BriefcaseBusiness,
    color: "border-emerald-400",
    iconColor: "text-emerald-300",
  },
  {
    label: "For Payment",
    icon: CreditCard,
    color: "border-amber-400",
    iconColor: "text-amber-300",
  },
  {
    label: "Completed",
    icon: Flag,
    color: "border-slate-400",
    iconColor: "text-slate-300",
  },
];

function WorkflowStage({
  label,
  value,
  icon: Icon,
  color,
  iconColor,
  badge,
  subtitle,
}: WorkflowStageProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      {/* Glowing Icon */}

      <div
        className={[
          "relative flex size-16 items-center justify-center rounded-full",
          "border bg-black/10",
          "transition duration-300",
          "hover:scale-105",
          color,
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-0 rounded-full opacity-20 blur-md",
            "bg-current",
            iconColor,
          ].join(" ")}
        />

        <Icon
          size={26}
          strokeWidth={1.5}
          className={["relative z-10", iconColor].join(" ")}
        />
      </div>

      {/* Value */}

      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">
        {value}
      </p>

      {/* Label */}

      <p
        className={[
          "mt-1 text-xs font-medium leading-5",
          label === "In Progress" ? "text-emerald-300" : "text-slate-200",
        ].join(" ")}
      >
        {label}
      </p>

      {/* Badge */}

      {badge && (
        <span className="mt-2 rounded-full bg-purple-400/[0.12] px-3 py-1 text-[10px] font-medium text-purple-300">
          {badge}
        </span>
      )}

      {subtitle && (
        <p className="mt-1 text-[10px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

function WorkflowArrow() {
  return (
    <div className="flex shrink-0 items-center justify-center pt-0">
      <ArrowRight size={18} strokeWidth={1.5} className="text-cyan-400/80" />
    </div>
  );
}

export function DashboardWorkflowSummary({
  stats,
}: DashboardWorkflowSummaryProps) {
  const workflow = stats.workflow;

  const forPayment = stats.jobs.forPayment;

  const stages: WorkflowStageProps[] = [
    {
      ...workflowStages[0],
      value: workflow.quotations,
      badge: "Open",
    },
    {
      ...workflowStages[1],
      value: workflow.forApproval,
    },
    {
      ...workflowStages[2],
      value: workflow.inProgress,
    },
    {
      ...workflowStages[3],
      value: forPayment,
    },
    {
      ...workflowStages[4],
      value: workflow.completed,
      subtitle: "This Month",
    },
  ];

  return (
    <div className="qufo-surface overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
      {/* Header */}

      <div className="flex items-start gap-3 px-5 py-5 sm:px-7">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
          <Workflow size={22} strokeWidth={1.6} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-200">
            Workflow Snapshot
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current status across your workflow.
          </p>
        </div>
      </div>

      {/* Divider */}

      <div className="border-t border-[var(--qufo-border)]" />

      {/* Workflow Pipeline */}

      <div className="overflow-x-auto px-5 py-8 sm:px-7 sm:py-10">
        <div className="mx-auto flex min-w-[570px] items-start justify-between gap-2 sm:min-w-0 sm:gap-3">
          {stages.map((stage, index) => (
            <div key={stage.label} className="contents">
              <WorkflowStage {...stage} />

              {index < stages.length - 1 && <WorkflowArrow />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
