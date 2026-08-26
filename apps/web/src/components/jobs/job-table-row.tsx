import {
  Eye,
} from "lucide-react";

import {
  JobPriorityBadge,
} from "@/components/jobs/job-priority-badge";

import {
  JobProgress,
} from "@/components/jobs/job-progress";

import {
  JobStatusBadge,
} from "@/components/jobs/job-status-badge";

import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatDate,
} from "@/utils/date";

import {
  isJobOverdue,
} from "@/utils/job";

import type {
  Job,
} from "@/types/job";

type JobTableRowProps = {
  job: Job;

  onOpen: (
    job: Job,
  ) => void;
};

export function JobTableRow({
  job,
  onOpen,
}: JobTableRowProps) {
  const overdue =
    isJobOverdue(job);

  const customerName =
    job.customer.companyName ??
    job.customer.name;

  const contactName =
    job.customer.companyName
      ? job.customer.name
      : null;

  const dueDate =
    job.dueDate
      ? formatDate(job.dueDate)
      : null;

  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      {/* Main job information */}
      <td className="min-w-0 px-4 py-4 sm:px-5">
        <p className="break-words text-sm font-medium text-slate-200">
          {job.jobNumber}
        </p>

        <p className="mt-1 break-words text-xs leading-5 text-slate-600">
          {job.title}
        </p>

        {/* Mobile / tablet summary */}
        <div className="mt-4 space-y-3 xl:hidden">
          <div>
            <p className="break-words text-sm text-slate-300">
              {customerName}
            </p>

            {contactName && (
              <p className="mt-0.5 break-words text-xs text-slate-600">
                {contactName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <JobStatusBadge
              status={job.status}
            />

            <JobPriorityBadge
              priority={job.priority}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Progress
            </p>

            <div className="max-w-sm">
              <JobProgress
                status={job.status}
              />
            </div>
          </div>

          <div
            className="
              flex
              flex-col
              gap-1.5
              border-t
              border-[var(--qufo-border)]
              pt-3

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-sm font-medium text-slate-300">
              {formatCurrency(
                job.total,
              )}
            </p>

            <p
              className={
                dueDate
                  ? overdue
                    ? "text-xs text-red-300"
                    : "text-xs text-slate-600"
                  : "text-xs text-slate-700"
              }
            >
              {dueDate
                ? `Due ${dueDate}`
                : "No due date"}
            </p>
          </div>
        </div>
      </td>

      {/* Customer - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <p className="text-sm text-slate-300">
          {customerName}
        </p>

        {contactName && (
          <p className="mt-1 text-xs text-slate-600">
            {contactName}
          </p>
        )}
      </td>

      {/* Status - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <JobStatusBadge
          status={job.status}
        />
      </td>

      {/* Priority - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <JobPriorityBadge
          priority={job.priority}
        />
      </td>

      {/* Due date - desktop */}
      <td className="hidden px-5 py-4 text-sm xl:table-cell">
        {dueDate ? (
          <span
            className={
              overdue
                ? "text-red-300"
                : "text-slate-500"
            }
          >
            {dueDate}
          </span>
        ) : (
          <span className="text-slate-700">
            —
          </span>
        )}
      </td>

      {/* Progress - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <JobProgress
          status={job.status}
        />
      </td>

      {/* Value - desktop */}
      <td className="hidden px-5 py-4 font-medium text-slate-300 xl:table-cell">
        {formatCurrency(
          job.total,
        )}
      </td>

      {/* Action */}
      <td className="w-16 whitespace-nowrap px-2 py-4 sm:w-20 sm:px-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onOpen(job)
            }
            title="View job"
            aria-label={`View ${job.jobNumber}`}
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-cyan-400/[0.07]
              hover:text-cyan-300

              sm:size-9
            "
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}