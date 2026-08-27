import {
  formatCurrency,
} from "@/utils/currency";

import type {
  Job,
} from "@/types/job";

type JobValueCardProps = {
  job: Job;
};

export function JobValueCard({
  job,
}: JobValueCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-600">
            Job value
          </p>

          {job.quotation && (
            <p className="mt-2 text-xs text-slate-500">
              From{" "}
              {
                job.quotation
                  .quotationNumber
              }
            </p>
          )}
        </div>

        <p className="text-2xl font-semibold text-emerald-300">
          {formatCurrency(
            job.total,
            job.currency
          )}
        </p>
      </div>
    </div>
  );
}