import {
  JOB_PROGRESS,
} from "@/constants/job";

import type {
  Job,
  JobStatus,
  PublicJob,
  PublicJobTimelineEntry,
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

export type PublicJobStepState =
  | "completed"
  | "current"
  | "pending";

export function getPublicJobStepState(
  job: PublicJob,
  stepStatus: JobStatus,
): PublicJobStepState {
  if (
    job.status ===
    stepStatus
  ) {
    return "current";
  }

  const reachedStatus =
    job.timeline.some(
      (entry) =>
        entry.status ===
        stepStatus,
    );

  if (reachedStatus) {
    return "completed";
  }

  const order:
    JobStatus[] = [
    "PENDING",
    "QUEUED",
    "IN_PROGRESS",
    "FOR_REVIEW",
    "READY",
    "DELIVERED",
    "COMPLETED",
  ];

  const currentIndex =
    order.indexOf(
      job.status,
    );

  const stepIndex =
    order.indexOf(
      stepStatus,
    );

  if (
    currentIndex >= 0 &&
    stepIndex <
      currentIndex
  ) {
    return "completed";
  }

  return "pending";
}

export function getLatestPublicJobTimelineEntry(
  job: PublicJob,
  status: JobStatus,
) {
  return (
    [...job.timeline]
      .reverse()
      .find(
        (entry) =>
          entry.status ===
          status,
      ) ?? null
  );
}

export function getLatestPublicJobMessage(
  job: PublicJob,
  status: JobStatus,
) {
  return (
    getLatestPublicJobTimelineEntry(
      job,
      status,
    )?.message ??
    null
  );
}

export function getLatestPublicJobUpdateDate(
  job: PublicJob,
  status: JobStatus,
) {
  return (
    getLatestPublicJobTimelineEntry(
      job,
      status,
    )?.createdAt ??
    null
  );
}

export function getLatestPublicJobUpdates(
  timeline:
    PublicJobTimelineEntry[],
  limit = 5,
) {
  return [
    ...timeline,
  ]
    .reverse()
    .slice(
      0,
      limit,
    );
}