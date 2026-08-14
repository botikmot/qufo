import {
  getJobProgress,
} from "@/utils/job";

import type {
  JobStatus,
} from "@/types/job";

type JobProductionProgressProps = {
  status: JobStatus;
};

export function JobProductionProgress({
  status,
}: JobProductionProgressProps) {
  const progress =
    getJobProgress(status);

  return (
    <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">
            Production progress
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Based on the current
            production stage.
          </p>
        </div>

        <span className="text-sm font-medium text-emerald-300">
          {progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}