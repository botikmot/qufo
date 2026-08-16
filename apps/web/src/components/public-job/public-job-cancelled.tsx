import {
  XCircle,
} from "lucide-react";

import {
  formatDateTime,
} from "@/utils/date";

import {
  getLatestPublicJobTimelineEntry,
} from "@/utils/job";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobCancelledProps = {
  job: PublicJob;
};

export function PublicJobCancelled({
  job,
}: PublicJobCancelledProps) {
  const cancellation =
    getLatestPublicJobTimelineEntry(
      job,
      "CANCELLED",
    );

  return (
    <div className="border-b border-red-400/10 bg-red-400/[0.035] p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <XCircle
          size={20}
          className="mt-0.5 shrink-0 text-red-300"
        />

        <div>
          <p className="font-medium text-red-200">
            Job cancelled
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {cancellation
              ?.message ??
              "This job is no longer in active production. Please contact the business if you need more information."}
          </p>

          {cancellation && (
            <p className="mt-2 text-[11px] text-slate-700">
              {formatDateTime(
                cancellation.createdAt,
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}