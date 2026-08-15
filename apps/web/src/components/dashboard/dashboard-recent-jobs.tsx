import Link from "next/link";

import {
  BriefcaseBusiness,
} from "lucide-react";

import {
  JobStatusBadge,
} from "@/components/jobs/job-status-badge";

import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatDate,
} from "@/utils/date";

import type {
  DashboardRecentJob,
} from "@/types/dashboard";

import {
  JobPriorityBadge,
} from "@/components/jobs/job-priority-badge";

type DashboardRecentJobsProps = {
  jobs: DashboardRecentJob[];
};

export function DashboardRecentJobs({
  jobs,
}: DashboardRecentJobsProps) {
  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-[var(--qufo-border)] px-5 py-4">
        <div>
          <h2 className="text-sm font-medium text-slate-300">
            Recent Jobs
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Latest production jobs.
          </p>
        </div>

        <Link
          href="/jobs"
          className="text-xs text-cyan-300/70 transition hover:text-cyan-300"
        >
          View all
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
          <BriefcaseBusiness
            size={20}
            className="mb-3 text-slate-700"
          />

          <p className="text-sm text-slate-600">
            No jobs yet
          </p>
        </div>
      ) : (
        <div>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between gap-4 border-b border-[var(--qufo-border)] px-5 py-4 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-300">
                  {job.jobNumber}
                </p>

                <p className="mt-1 truncate text-xs text-slate-600">
                  {job.title}
                </p>

                <p className="mt-1 text-xs text-slate-700">
                  {job.dueDate
                    ? `Due ${formatDate(
                        job.dueDate,
                      )}`
                    : "No due date"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">

                <JobPriorityBadge
                  priority={job.priority}
                />
                
                <JobStatusBadge
                  status={job.status}
                />

                <span className="text-xs font-medium text-slate-400">
                  {formatCurrency(
                    job.total,
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}