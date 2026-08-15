"use client";

import {
  JobActivityHistory,
} from "@/components/jobs/job-activity-history";

import {
  JobDetailHeader,
} from "@/components/jobs/job-detail-header";

import {
  JobInfoGrid,
} from "@/components/jobs/job-info-grid";

import {
  JobItemsList,
} from "@/components/jobs/job-items-list";

import {
  JobLifecycleActions,
} from "@/components/jobs/job-lifecycle-actions";

import {
  JobPaymentCard,
} from "@/components/jobs/job-payment-card";

import {
  JobProductionProgress,
} from "@/components/jobs/job-production-progress";

import {
  JobStatusUpdateForm,
} from "@/components/jobs/job-status-update-form";

import {
  JobTrackingCard,
} from "@/components/jobs/job-tracking-card";

import {
  JobValueCard,
} from "@/components/jobs/job-value-card";

import {
  useJobDetail,
} from "@/hooks/use-job-detail";

import type {
  Job,
  JobStatus,
} from "@/types/job";

type JobDetailModalProps = {
  job: Job;

  actionLoading: boolean;

  canCancel: boolean;
  canReopen: boolean;

  onClose: () => void;

  onChangeStatus: (
    status: JobStatus,
    message: string,
    publicMessage: string,
  ) => Promise<void>;

  onCancel: (
    reason: string,
  ) => Promise<void>;

  onReopen:
    () => Promise<void>;

  onGenerateTrackingLink:
    () => Promise<string>;
};

export function JobDetailModal({
  job,
  actionLoading,
  canCancel,
  canReopen,
  onClose,
  onChangeStatus,
  onCancel,
  onReopen,
  onGenerateTrackingLink,
}: JobDetailModalProps) {
  const detail =
    useJobDetail({
      job,
      onChangeStatus,
      onGenerateTrackingLink,
    });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl">
        <JobDetailHeader
          job={job}
          loading={
            actionLoading
          }
          onClose={
            onClose
          }
        />

        <div className="space-y-7 p-6">
          <JobInfoGrid
            job={job}
          />

          <JobProductionProgress
            status={
              job.status
            }
          />

          <JobItemsList
            items={
              job.items
            }
          />

          <JobValueCard
            job={job}
          />

          <JobPaymentCard
            job={job}
          />

          <JobTrackingCard
            trackingEnabled={
              job.trackingEnabled
            }
            trackingLink={
              detail.trackingLink
            }
            trackingError={
              detail.trackingError
            }
            copied={
              detail.copied
            }
            loading={
              actionLoading
            }
            onGenerate={() =>
              void detail.generateTrackingLink()
            }
            onCopy={() =>
              void detail.copyTrackingLink()
            }
          />

          <JobStatusUpdateForm
            nextStatuses={
              detail.nextStatuses
            }
            selectedStatus={
              detail.selectedStatus
            }
            internalMessage={
              detail.internalMessage
            }
            publicMessage={
              detail.publicMessage
            }
            loading={
              actionLoading
            }
            onStatusChange={
              detail.setSelectedStatus
            }
            onInternalMessageChange={
              detail.setInternalMessage
            }
            onPublicMessageChange={
              detail.setPublicMessage
            }
            onSubmit={() =>
              void detail.updateStatus()
            }
          />

          <JobLifecycleActions
            job={job}
            cancellationReason={
              detail.cancellationReason
            }
            canCancel={
              canCancel
            }
            canReopen={
              canReopen
            }
            loading={
              actionLoading
            }
            onCancellationReasonChange={
              detail.setCancellationReason
            }
            onCancel={() =>
              void onCancel(
                detail.cancellationReason,
              )
            }
            onReopen={() =>
              void onReopen()
            }
          />

          <JobActivityHistory
            updates={
              job.updates
            }
          />
        </div>
      </div>
    </div>
  );
}