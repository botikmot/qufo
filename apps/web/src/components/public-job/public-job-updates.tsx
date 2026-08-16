import {
  PackageOpen,
} from "lucide-react";

import {
  formatDateTime,
} from "@/utils/date";

import {
  getLatestPublicJobUpdates,
} from "@/utils/job";

import type {
  PublicJob,
} from "@/types/job";

type PublicJobUpdatesProps = {
  job: PublicJob;
};

export function PublicJobUpdates({
  job,
}: PublicJobUpdatesProps) {
  const updates =
    getLatestPublicJobUpdates(
      job.timeline,
      5,
    );

  if (
    updates.length === 0
  ) {
    return null;
  }

  return (
    <div className="border-t border-[var(--qufo-border)] p-6 sm:p-8">
      <h2 className="text-sm font-medium text-slate-300">
        Latest updates
      </h2>

      <div className="mt-4 space-y-3">
        {updates.map(
          (update) => (
            <div
              key={`${update.status}-${update.createdAt}`}
              className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4"
            >
              <div className="flex items-start gap-3">
                <PackageOpen
                  size={16}
                  className="mt-0.5 shrink-0 text-cyan-300"
                />

                <div>
                  <p className="text-sm leading-6 text-slate-300">
                    {
                      update.message
                    }
                  </p>

                  <p className="mt-1 text-[11px] text-slate-600">
                    {formatDateTime(
                      update.createdAt,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}