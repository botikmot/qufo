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
  QufoModal,
} from "@/components/ui/qufo-modal";

import {
  useJobDetail,
} from "@/hooks/use-job-detail";

import type {
  Job,
  JobStatus,
} from "@/types/job";

import {
  JobPdfActions,
} from "@/components/jobs/pdf/job-pdf-actions";

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
    <QufoModal
      title={`Job ${job.jobNumber}`}
      onClose={onClose}
      closeDisabled={
        actionLoading
      }
      size="4xl"
      customHeader={
        <JobDetailHeader
          job={job}
          loading={
            actionLoading
          }
          onClose={
            onClose
          }
        />
      }
    >
      <div className="min-w-0 space-y-7">
        <JobInfoGrid
          job={job}
        />

        <JobProductionProgress
          status={
            job.status
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

        {detail.trackingLink && (
          <JobPdfActions
            job={job}
            trackingUrl={
              detail.trackingLink
            }
          />
        )}

        <JobActivityHistory
          updates={
            job.updates
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
      </div>
    </QufoModal>
  );
}