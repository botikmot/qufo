import {
  JOB_STATUS_LABELS,
  JOB_STATUS_STYLES,
} from "@/constants/job";

import type {
  JobStatus,
} from "@/types/job";

type PublicJobStatusBadgeProps = {
  status: JobStatus;
};

export function PublicJobStatusBadge({
  status,
}: PublicJobStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${JOB_STATUS_STYLES[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />

      {
        JOB_STATUS_LABELS[
          status
        ]
      }
    </span>
  );
}