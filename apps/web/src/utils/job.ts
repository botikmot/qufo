import {
  JOB_PROGRESS,
} from "@/constants/job";

import type {
  Job,
  JobStatus,
} from "@/types/job";

export function getJobProgress(
  status: JobStatus,
) {
  return JOB_PROGRESS[status];
}

export function isJobOverdue(
  job: Job,
) {
  if (
    !job.dueDate ||
    job.status === "COMPLETED" ||
    job.status === "CANCELLED"
  ) {
    return false;
  }

  return (
    new Date(job.dueDate).getTime() <
    Date.now()
  );
}

export function isJobCancellable(
  status: JobStatus,
) {
  return [
    "PENDING",
    "QUEUED",
    "IN_PROGRESS",
    "FOR_REVIEW",
    "READY",
  ].includes(status);
}