import Link from "next/link";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  Banknote,
  Activity,
} from "lucide-react";

import { formatCurrency } from "@/utils/currency";

import { formatDate } from "@/utils/date";

import type { DashboardRecentActivity } from "@/types/dashboard";
import type { ReactNode } from "react";

type DashboardRecentActivityProps = {
  activity: DashboardRecentActivity[];
};

function getActivityIcon(type: string): ReactNode {
  switch (type) {
    case "JOB":
      return <BriefcaseBusiness size={18} />;

    case "QUOTATION":
      return <FileText size={18} />;

    case "PAYMENT":
      return <Banknote size={18} />;

    default:
      return <Activity size={18} />;
  }
}

function getActivityLabel(type: DashboardRecentActivity["type"]) {
  switch (type) {
    case "JOB":
      return "Recent Job";

    case "QUOTATION":
      return "Recent Quotation";

    case "PAYMENT":
      return "Recent Payment";
  }
}

export function DashboardRecentActivity({
  activity,
}: DashboardRecentActivityProps) {
  const item = activity[0];

  if (!item) {
    return (
      <section className="min-w-0">
        <div className="qufo-surface rounded-2xl p-5">
          <p className="text-sm text-slate-500">No recent activity yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <div className="qufo-surface overflow-hidden rounded-2xl">
        {/* Header */}

        <div className="flex items-center justify-between gap-3 border-b border-[var(--qufo-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              {getActivityIcon(item.type)}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest activity across your QUFO workflow.
              </p>
            </div>
          </div>

          <Link
            href="/reports"
            className="flex shrink-0 items-center gap-1 text-xs text-cyan-300/70 transition hover:text-cyan-300"
          >
            View all
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Activity */}

        <div className="flex items-center justify-between gap-4 px-5 py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              {getActivityLabel(item.type)}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-200">
              {item.reference}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">{item.title}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-slate-600">
              {formatDate(item.createdAt)}
            </p>
            <p className="text-sm font-semibold text-slate-200 mt-2">
              {formatCurrency(item.total, item.currency)}
            </p>

            <p className="mt-1 text-xs text-cyan-300">{item.status}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
