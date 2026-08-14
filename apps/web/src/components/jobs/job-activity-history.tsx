import {
  JobStatusBadge,
} from "@/components/jobs/job-status-badge";

import {
  formatDateTime,
} from "@/utils/date";

import type {
  JobUpdate,
} from "@/types/job";

type JobActivityHistoryProps = {
  updates?: JobUpdate[];
};

export function JobActivityHistory({
  updates,
}: JobActivityHistoryProps) {
  if (!updates?.length) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-slate-300">
        Activity history
      </h3>

      <div className="space-y-3">
        {updates.map(
          (update) => (
            <div
              key={update.id}
              className="rounded-xl border border-[var(--qufo-border)] bg-black/10 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <JobStatusBadge
                  status={
                    update.status
                  }
                />

                <span className="text-xs text-slate-600">
                  {formatDateTime(
                    update.createdAt,
                  )}
                </span>
              </div>

              {update.message && (
                <p className="mt-3 text-sm text-slate-400">
                  {
                    update.message
                  }
                </p>
              )}

              {update.publicMessage && (
                <div className="mt-2 rounded-lg bg-cyan-400/[0.04] px-3 py-2 text-xs text-cyan-200/70">
                  Customer:{" "}
                  {
                    update.publicMessage
                  }
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}