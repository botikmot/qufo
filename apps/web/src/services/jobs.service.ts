import {
  apiFetch,
} from "@/lib/api";

import {
  type Job,
  type JobsResponse,
  type JobStatus,
  type PublicJob,
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

  getPublicByToken(
    token: string,
  ) {
    return apiFetch<PublicJob>(
      `/public/jobs/${token}`,
      {
        requireAuth: false,
      },
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
    return apiFetch<Job>(
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

  reopen(
    jobId: string,
  ) {
    return apiFetch<Job>(
      `/jobs/${jobId}/reopen`,
      {
        method: "POST",
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