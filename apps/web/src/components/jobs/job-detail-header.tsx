import {
  X,
} from "lucide-react";

import {
  JobStatusBadge,
} from "@/components/jobs/job-status-badge";

import type {
  Job,
} from "@/types/job";

type JobDetailHeaderProps = {
  job: Job;

  loading?: boolean;

  onClose: () => void;
};

export function JobDetailHeader({
  job,
  loading = false,
  onClose,
}: JobDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex items-start justify-between border-b border-[var(--qufo-border)] bg-[rgba(8,20,35,0.94)] px-6 py-5 backdrop-blur-xl">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            {job.jobNumber}
          </h2>

          <JobStatusBadge
            status={job.status}
          />
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {job.title}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
      >
        <X size={18} />
      </button>
    </div>
  );
}