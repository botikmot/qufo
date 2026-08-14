import {
  BriefcaseBusiness,
} from "lucide-react";

import {
  JobTableRow,
} from "@/components/jobs/job-table-row";

import {
  LoadingState,
} from "@/components/shared/loading-state";

import {
  Pagination,
} from "@/components/shared/pagination";

import {
  TableHead,
} from "@/components/shared/table-head";

import type {
  Job,
} from "@/types/job";

type JobsTableProps = {
  jobs: Job[];

  loading: boolean;

  page: number;
  pages: number;
  total: number;

  onOpen: (
    job: Job,
  ) => void;

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
  if (loading) {
    return (
      <div className="qufo-surface overflow-hidden rounded-2xl">
        <LoadingState label="Loading jobs..." />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="qufo-surface flex min-h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-cyan-400/[0.04] text-cyan-300">
          <BriefcaseBusiness
            size={20}
          />
        </div>

        <h3 className="font-medium text-slate-300">
          No jobs found
        </h3>

        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Approved quotations
          can be converted into
          production jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-[var(--qufo-border)]">
              <TableHead>
                Job
              </TableHead>

              <TableHead>
                Customer
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Priority
              </TableHead>

              <TableHead>
                Due Date
              </TableHead>

              <TableHead>
                Progress
              </TableHead>

              <TableHead>
                Value
              </TableHead>

              <TableHead>
                <span className="sr-only">
                  Actions
                </span>
              </TableHead>
            </tr>
          </thead>

          <tbody>
            {jobs.map(
              (job) => (
                <JobTableRow
                  key={job.id}
                  job={job}
                  onOpen={onOpen}
                />
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {total} jobs
        </p>

        <Pagination
          page={page}
          pages={pages}
          loading={loading}
          onPrevious={
            onPrevious
          }
          onNext={
            onNext
          }
        />
      </div>
    </div>
  );
}