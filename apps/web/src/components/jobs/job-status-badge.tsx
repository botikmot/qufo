import {
  JOB_STATUS_LABELS,
  JOB_STATUS_STYLES,
} from "@/constants/job";

import type {
  JobStatus,
} from "@/types/job";

type JobStatusBadgeProps = {
  status: JobStatus;
};

export function JobStatusBadge({
  status,
}: JobStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${JOB_STATUS_STYLES[status]}`}
    >
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}