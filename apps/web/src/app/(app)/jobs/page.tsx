"use client";

import { ArrowRight, BriefcaseBusiness } from "lucide-react";

import { JobDetailModal } from "@/components/jobs/job-detail-modal";

import { JobsTable } from "@/components/jobs/jobs-table";

import { JobsToolbar } from "@/components/jobs/jobs-toolbar";

import { useJobs } from "@/hooks/use-jobs";

import { useAuthSession } from "@/lib/auth-storage";

import { isJobCancellable } from "@/utils/job";

import { canCancelJob, canReopenJob } from "@/utils/job-permission";

export default function JobsPage() {
  const session = useAuthSession();

  const jobs = useJobs();

  const selectedJob = jobs.selectedJob;

  const role = session?.organization.role;

  const canCancel = selectedJob
    ? canCancelJob(role) && isJobCancellable(selectedJob.status)
    : false;

  const canReopen = selectedJob
    ? selectedJob.status === "CANCELLED" && canReopenJob(role)
    : false;

  return (
    <div className="min-w-0 space-y-6 pb-6">
      {/* =========================================================
          JOB HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#07192B]">
        {/* Ambient glow */}

        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.04] blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-blue-500/[0.04] blur-3xl"
          aria-hidden="true"
        />

        {/* Decorative waves */}

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            className="absolute right-0 top-0 h-full w-3/4"
            fill="none"
          >
            <path
              d="M0 120 C120 20 200 30 320 105 S520 175 650 70 S820 15 1040 70"
              stroke="#06B6D4"
              strokeWidth="1"
              opacity="0.5"
            />

            <path
              d="M0 145 C140 65 230 50 370 125 S570 170 710 90 S850 40 1040 95"
              stroke="#0E7490"
              strokeWidth="0.8"
              opacity="0.45"
            />
          </svg>
        </div>

        <div className="relative z-10 p-6 sm:p-7">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/70">
            Job Management
          </p>

          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              <BriefcaseBusiness size={22} strokeWidth={1.7} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Jobs
            </h1>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Track production work from approved quotation to completion.
          </p>
        </div>
      </section>

      {/* =========================================================
          JOB SUMMARY
      ========================================================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Total jobs */}

        <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#091C2E] p-5 transition hover:border-cyan-400/35">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-cyan-400/[0.05] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              <BriefcaseBusiness size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Total Jobs
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {jobs.total}
              </p>
            </div>
          </div>
        </div>

        {/* Directory */}

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#091C2E] p-5 transition hover:border-cyan-400/20">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Directory
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                Page {jobs.page} of {jobs.pages || 1}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Browse your production jobs
              </p>
            </div>

            <ArrowRight
              size={18}
              className="shrink-0 text-slate-700 transition duration-200 group-hover:translate-x-1 group-hover:text-cyan-300"
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}

      {jobs.error && (
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {jobs.error}
        </div>
      )}

      {/* =========================================================
          JOB DIRECTORY
      ========================================================= */}

      <section className="qufo-surface min-w-0 overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
        {/* Directory header + search/filter */}

        <div className="flex flex-col gap-4 border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Header */}

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-200">
              Job Directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search and manage production jobs across your workspace.
            </p>
          </div>

          {/* Search + status filter */}

          <div className="w-full lg:max-w-[650px]">
            <JobsToolbar
              search={jobs.search}
              status={jobs.status}
              onSearchChange={jobs.setSearch}
              onSearch={jobs.handleSearch}
              onStatusChange={(status) => void jobs.changeStatus(status)}
            />
          </div>
        </div>

        {/* =======================================================
            TABLE
        ======================================================= */}

        <JobsTable
          jobs={jobs.jobs}
          loading={jobs.loading}
          page={jobs.page}
          pages={jobs.pages}
          total={jobs.total}
          onOpen={(job) => void jobs.openJob(job)}
          onPrevious={() => void jobs.previousPage()}
          onNext={() => void jobs.nextPage()}
        />
      </section>

      {/* =========================================================
          JOB DETAIL MODAL
      ========================================================= */}

      {selectedJob && (
        <JobDetailModal
          key={`${selectedJob.id}-${selectedJob.status}`}
          job={selectedJob}
          actionLoading={jobs.actionLoading}
          canCancel={canCancel}
          canReopen={canReopen}
          onClose={jobs.closeJob}
          onChangeStatus={jobs.updateJobStatus}
          onCancel={jobs.cancelJob}
          onReopen={jobs.reopenJob}
          onGenerateTrackingLink={jobs.generateTrackingLink}
        />
      )}
    </div>
  );
}
