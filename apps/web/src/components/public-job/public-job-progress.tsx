import {
  Clock3,
} from "lucide-react";

import {
  formatDate,
} from "@/utils/date";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobProgressProps = {
  job: PublicJob;
};

export function PublicJobProgress({
  job,
}: PublicJobProgressProps) {
  return (
    <div className="border-b border-[var(--qufo-border)] p-6 sm:p-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-300">
            Overall progress
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Based on the current
            production stage.
          </p>
        </div>

        <p className="text-2xl font-semibold text-emerald-300">
          {job.progress}%
        </p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-700"
          style={{
            width:
              `${job.progress}%`,
          }}
        />
      </div>

      {job.dueDate && (
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <Clock3
            size={14}
          />

          Expected / due:{" "}
          <span className="text-slate-300">
            {formatDate(
              job.dueDate,
            )}
          </span>
        </div>
      )}
    </div>
  );
}