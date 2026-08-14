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

  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      <td className="px-5 py-4">
        <p className="font-medium text-slate-200">
          {job.jobNumber}
        </p>

        <p className="mt-1 max-w-xs truncate text-xs text-slate-600">
          {job.title}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-300">
          {job.customer
            .companyName ??
            job.customer.name}
        </p>

        {job.customer
          .companyName && (
          <p className="mt-1 text-xs text-slate-600">
            {job.customer.name}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <JobStatusBadge
          status={job.status}
        />
      </td>

      <td className="px-5 py-4">
        <JobPriorityBadge
          priority={
            job.priority
          }
        />
      </td>

      <td className="px-5 py-4 text-sm">
        {job.dueDate ? (
          <span
            className={
              overdue
                ? "text-red-300"
                : "text-slate-500"
            }
          >
            {formatDate(
              job.dueDate,
            )}
          </span>
        ) : (
          <span className="text-slate-700">
            —
          </span>
        )}
      </td>

      <td className="px-5 py-4">
        <JobProgress
          status={job.status}
        />
      </td>

      <td className="px-5 py-4 font-medium text-slate-300">
        {formatCurrency(
          job.total,
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onOpen(job)
            }
            title="View job"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-cyan-400/[0.07] hover:text-cyan-300"
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}