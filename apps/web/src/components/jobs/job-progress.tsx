import {
  getJobProgress,
} from "@/utils/job";

import type {
  JobStatus,
} from "@/types/job";

type JobProgressProps = {
  status: JobStatus;
};

export function JobProgress({
  status,
}: JobProgressProps) {
  const progress =
    getJobProgress(status);

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <span className="text-xs text-slate-500">
        {progress}%
      </span>
    </div>
  );
}