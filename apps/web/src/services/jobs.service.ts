import {
  apiFetch,
} from "@/lib/api";

import type {
  Job,
  JobsResponse,
  JobStatus,
} from "@/types/job";

export type JobsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus | "ALL";
};

export type UpdateJobStatusPayload = {
  status: JobStatus;
  message?: string;
  publicMessage?: string;
};

export type TrackingLinkResponse = {
  jobNumber: string;
  trackingUrl: string;
};

export const jobsService = {
  getAll(
    query: JobsQuery = {},
  ) {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(query.page ?? 1),
    );

    params.set(
      "limit",
      String(query.limit ?? 20),
    );

    if (query.search) {
      params.set(
        "search",
        query.search,
      );
    }

    if (
      query.status &&
      query.status !== "ALL"
    ) {
      params.set(
        "status",
        query.status,
      );
    }

    return apiFetch<JobsResponse>(
      `/jobs?${params.toString()}`,
    );
  },

  getOne(
    jobId: string,
  ) {
    return apiFetch<Job>(
      `/jobs/${jobId}`,
    );
  },

  updateStatus(
    jobId: string,
    payload: UpdateJobStatusPayload,
  ) {
    return apiFetch(
      `/jobs/${jobId}/status`,
      {
        method: "POST",

        body: JSON.stringify({
          status:
            payload.status,

          message:
            payload.message ||
            undefined,

          publicMessage:
            payload.publicMessage ||
            undefined,
        }),
      },
    );
  },

  generateTrackingLink(
    jobId: string,
  ) {
    return apiFetch<TrackingLinkResponse>(
      `/jobs/${jobId}/tracking-link`,
      {
        method: "POST",
      },
    );
  },
};