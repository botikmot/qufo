import { BriefcaseBusiness } from "lucide-react";

import { JobTableRow } from "@/components/jobs/job-table-row";

import { LoadingState } from "@/components/shared/loading-state";

import { Pagination } from "@/components/shared/pagination";

import { TableHead } from "@/components/shared/table-head";

import type { Job } from "@/types/job";

type JobsTableProps = {
  jobs: Job[];

  loading: boolean;

  page: number;
  pages: number;
  total: number;

  onOpen: (job: Job) => void;

  onPrevious: () => void;
  onNext: () => void;
};

export function JobsTable({
  jobs,
  loading,
  page,
  pages,
  total,
  onOpen,
  onPrevious,
  onNext,
}: JobsTableProps) {
  /*
   * Loading
   */

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center px-6">
        <LoadingState label="Loading jobs..." />
      </div>
    );
  }

  /*
   * Empty state
   */

  if (jobs.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-5 flex size-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/[0.04] blur-xl" />

          <BriefcaseBusiness size={24} strokeWidth={1.6} className="relative" />
        </div>

        <h3 className="text-sm font-semibold text-slate-200">No jobs found</h3>

        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Approved quotations can be converted into production jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* =========================================================
          JOB TABLE
      ========================================================= */}

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          {/* HEADER */}

          <thead>
            <tr className="border-b border-[var(--qufo-border)]">
              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Job
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Customer
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Status
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Priority
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Due Date
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Progress
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Value
                </span>
              </TableHead>

              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </tr>
          </thead>

          {/* BODY */}

          <tbody>
            {jobs.map((job) => (
              <JobTableRow key={job.id} job={job} onOpen={onOpen} />
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <div className="flex flex-col gap-4 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cyan-400" />

          <p className="text-xs text-slate-500 sm:text-sm">
            <span className="font-medium text-slate-300">{total}</span>{" "}
            {total === 1 ? "job" : "jobs"}
          </p>
        </div>

        <div className="flex items-center justify-end">
          <Pagination
            page={page}
            pages={pages}
            loading={loading}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
}
