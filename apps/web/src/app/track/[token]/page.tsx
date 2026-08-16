"use client";

import {
  useParams,
} from "next/navigation";

import {
  PublicJobCancelled,
} from "@/components/public-job/public-job-cancelled";

import {
  PublicJobCompleted,
} from "@/components/public-job/public-job-completed";

import {
  PublicJobContact,
} from "@/components/public-job/public-job-contact";

import {
  PublicJobHeader,
} from "@/components/public-job/public-job-header";

import {
  PublicJobInfo,
} from "@/components/public-job/public-job-info";

import {
  PublicJobItems,
} from "@/components/public-job/public-job-items";

import {
  PublicJobJourney,
} from "@/components/public-job/public-job-journey";

import {
  PublicJobLoading,
} from "@/components/public-job/public-job-loading";

import {
  PublicJobProgress,
} from "@/components/public-job/public-job-progress";

import {
  PublicJobUnavailable,
} from "@/components/public-job/public-job-unavailable";

import {
  PublicJobUpdates,
} from "@/components/public-job/public-job-updates";

import {
  PublicPageFooter,
} from "@/components/shared/public-page-footer";

import {
  usePublicJob,
} from "@/hooks/use-public-job";

export default function PublicJobTrackingPage() {
  const params =
    useParams<{
      token: string;
    }>();

  const {
    job,
    loading,
    refreshing,
    error,
    refreshJob,
  } = usePublicJob(
    params.token,
  );

  if (loading) {
    return (
      <PublicJobLoading />
    );
  }

  if (
    error &&
    !job
  ) {
    return (
      <PublicJobUnavailable
        message={error}
      />
    );
  }

  if (!job) {
    return null;
  }

  const isCancelled =
    job.status ===
    "CANCELLED";

  const isCompleted =
    job.status ===
    "COMPLETED";

  return (
    <main className="qufo-background min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <PublicJobHeader
          job={job}
          refreshing={
            refreshing
          }
          onRefresh={() =>
            void refreshJob()
          }
        />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="qufo-surface overflow-hidden rounded-3xl">
          <PublicJobInfo
            job={job}
          />

          <PublicJobProgress
            job={job}
          />

          {isCancelled ? (
            <PublicJobCancelled
              job={job}
            />
          ) : (
            <PublicJobJourney
              job={job}
            />
          )}

          <PublicJobItems
            items={job.items}
          />

          <PublicJobUpdates
            job={job}
          />

          {isCompleted && (
            <PublicJobCompleted />
          )}
        </section>

        <PublicJobContact
          organization={
            job.organization
          }
        />

        <PublicPageFooter
          label="Secure job tracking powered by QUFO"
        />
      </div>
    </main>
  );
}