"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  jobsService,
} from "@/services/jobs.service";

import type {
  Job,
  JobStatus,
} from "@/types/job";

import type {
  JobStatusFilter,
} from "@/components/jobs/jobs-toolbar";

export function useJobs() {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [
    selectedJob,
    setSelectedJob,
  ] =
    useState<Job | null>(
      null,
    );

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [
    activeSearch,
    setActiveSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<JobStatusFilter>(
      "ALL",
    );

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    jobsService
      .getAll({
        page: 1,
        limit: 20,
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        setJobs(
          data.items,
        );

        setPage(
          data.pagination.page,
        );

        setPages(
          data.pagination.pages,
        );

        setTotal(
          data.pagination.total,
        );
      })
      .catch(
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load jobs.",
          );
        },
      )
      .finally(() => {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadJobs(
    options?: {
      page?: number;
      search?: string;
      status?:
        JobStatusFilter;
    },
  ) {
    const targetPage =
      options?.page ?? page;

    const targetSearch =
      options?.search ??
      activeSearch;

    const targetStatus =
      options?.status ??
      status;

    setLoading(true);
    setError(null);

    try {
      const data =
        await jobsService.getAll({
          page: targetPage,
          limit: 20,

          search:
            targetSearch ||
            undefined,

          status:
            targetStatus,
        });

      setJobs(
        data.items,
      );

      setPage(
        data.pagination.page,
      );

      setPages(
        data.pagination.pages,
      );

      setTotal(
        data.pagination.total,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load jobs.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value =
      search.trim();

    setActiveSearch(
      value,
    );

    await loadJobs({
      page: 1,
      search: value,
    });
  }

  async function changeStatus(
    value: JobStatusFilter,
  ) {
    setStatus(
      value,
    );

    await loadJobs({
      page: 1,
      status: value,
    });
  }

  async function openJob(
    job: Job,
  ) {
    setError(null);

    try {
      const fullJob =
        await jobsService.getOne(
          job.id,
        );

      setSelectedJob(
        fullJob,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load job.",
      );
    }
  }

  function closeJob() {
    setSelectedJob(
      null,
    );
  }

  async function refreshSelectedJob(
    jobId: string,
  ) {
    const refreshed =
      await jobsService.getOne(
        jobId,
      );

    setSelectedJob(
      refreshed,
    );

    await loadJobs({
      page,
    });
  }

  async function updateJobStatus(
    status: JobStatus,
    message: string,
    publicMessage: string,
  ) {
    if (!selectedJob) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      await jobsService.updateStatus(
        selectedJob.id,
        {
          status,

          message:
            message ||
            undefined,

          publicMessage:
            publicMessage ||
            undefined,
        },
      );

      await refreshSelectedJob(
        selectedJob.id,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update job status.",
      );

      throw error;
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  async function cancelJob(
    reason: string,
  ) {
    if (!selectedJob) {
      return;
    }

    const cancellationReason =
      reason.trim();

    if (!cancellationReason) {
      throw new Error(
        "A cancellation reason is required.",
      );
    }

    const confirmed =
      window.confirm(
        `Cancel ${selectedJob.jobNumber}? This will stop the current production workflow.`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      await jobsService.updateStatus(
        selectedJob.id,
        {
          status:
            "CANCELLED",

          message:
            cancellationReason,
        },
      );

      await refreshSelectedJob(
        selectedJob.id,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel job.",
      );

      throw error;
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  async function reopenJob() {
    if (!selectedJob) {
      return;
    }

    const confirmed =
      window.confirm(
        `Reopen ${selectedJob.jobNumber}? The job will return to its previous production status.`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      await jobsService.reopen(
        selectedJob.id,
      );

      await refreshSelectedJob(
        selectedJob.id,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reopen job.",
      );

      throw error;
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  async function generateTrackingLink() {
    if (!selectedJob) {
      throw new Error(
        "No selected job.",
      );
    }

    setActionLoading(
      true,
    );

    setError(null);

    try {
      const response =
        await jobsService
          .generateTrackingLink(
            selectedJob.id,
          );

      const refreshed =
        await jobsService.getOne(
          selectedJob.id,
        );

      setSelectedJob(
        refreshed,
      );

      return response.trackingUrl;
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  return {
    jobs,
    selectedJob,

    page,
    pages,
    total,

    search,
    status,

    loading,
    actionLoading,
    error,

    setSearch,

    handleSearch,
    changeStatus,

    openJob,
    closeJob,

    updateJobStatus,
    cancelJob,
    reopenJob,

    generateTrackingLink,

    previousPage: () =>
      loadJobs({
        page:
          page - 1,
      }),

    nextPage: () =>
      loadJobs({
        page:
          page + 1,
      }),
  };
}