"use client";

import {
  PageHeader,
} from "@/components/app/page-header";

import {
  JobDetailModal,
} from "@/components/jobs/job-detail-modal";

import {
  JobsTable,
} from "@/components/jobs/jobs-table";

import {
  JobsToolbar,
} from "@/components/jobs/jobs-toolbar";

import {
  useJobs,
} from "@/hooks/use-jobs";

import {
  useAuthSession,
} from "@/lib/auth-storage";

import {
  isJobCancellable,
} from "@/utils/job";

import {
  canCancelJob,
  canReopenJob,
} from "@/utils/job-permission";

export default function JobsPage() {
  const session =
    useAuthSession();

  const jobs =
    useJobs();

  const selectedJob =
    jobs.selectedJob;

  const role =
    session?.organization.role;

  const canCancel =
    selectedJob
      ? canCancelJob(
          role,
        ) &&
        isJobCancellable(
          selectedJob.status,
        )
      : false;

  const canReopen =
    selectedJob
      ? selectedJob.status ===
          "CANCELLED" &&
        canReopenJob(
          role,
        )
      : false;

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Track production work from approved quotation to completion."
      />

      <JobsToolbar
        search={
          jobs.search
        }
        status={
          jobs.status
        }
        onSearchChange={
          jobs.setSearch
        }
        onSearch={
          jobs.handleSearch
        }
        onStatusChange={(
          status,
        ) =>
          void jobs.changeStatus(
            status,
          )
        }
      />

      {jobs.error && (
        <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {jobs.error}
        </div>
      )}

      <JobsTable
        jobs={
          jobs.jobs
        }
        loading={
          jobs.loading
        }
        page={
          jobs.page
        }
        pages={
          jobs.pages
        }
        total={
          jobs.total
        }
        onOpen={(job) =>
          void jobs.openJob(
            job,
          )
        }
        onPrevious={() =>
          void jobs.previousPage()
        }
        onNext={() =>
          void jobs.nextPage()
        }
      />

      {selectedJob && (
        <JobDetailModal
          key={`${selectedJob.id}-${selectedJob.status}`}
          job={
            selectedJob
          }
          actionLoading={
            jobs.actionLoading
          }
          canCancel={
            canCancel
          }
          canReopen={
            canReopen
          }
          onClose={
            jobs.closeJob
          }
          onChangeStatus={
            jobs.updateJobStatus
          }
          onCancel={
            jobs.cancelJob
          }
          onReopen={
            jobs.reopenJob
          }
          onGenerateTrackingLink={
            jobs.generateTrackingLink
          }
        />
      )}
    </>
  );
}