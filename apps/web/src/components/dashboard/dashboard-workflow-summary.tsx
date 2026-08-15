import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardWorkflowSummaryProps = {
  stats: DashboardResponse["stats"];
};

export function DashboardWorkflowSummary({
  stats,
}: DashboardWorkflowSummaryProps) {
  return (
    <div className="qufo-surface rounded-2xl p-5">
      <div>
        <h2 className="text-sm font-medium text-slate-300">
          Workflow Snapshot
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Current operational workload
          across quotations and jobs.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-2xl font-semibold text-cyan-300">
            {stats.jobs.dueToday}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Jobs due today
          </p>
        </div>

        <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-2xl font-semibold text-emerald-300">
            {stats.quotations.approved}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Approved quotations
          </p>
        </div>

        <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
          <p className="text-2xl font-semibold text-amber-300">
            {stats.quotations.open}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Open quotations
          </p>
        </div>
      </div>
    </div>
  );
}