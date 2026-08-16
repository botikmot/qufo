import {
  PublicJobStatusBadge,
} from "@/components/public-job/public-job-status-badge";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobInfoProps = {
  job: PublicJob;
};

export function PublicJobInfo({
  job,
}: PublicJobInfoProps) {
  return (
    <div className="border-b border-[var(--qufo-border)] p-6 sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
            Production Job
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {job.jobNumber}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {job.title}
          </p>

          <p className="mt-4 text-xs text-slate-600">
            Customer:{" "}
            <span className="text-slate-400">
              {job.customer.name}
            </span>
          </p>
        </div>

        <PublicJobStatusBadge
          status={job.status}
        />
      </div>
    </div>
  );
}