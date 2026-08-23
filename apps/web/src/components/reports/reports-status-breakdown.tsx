import type {
  ReportData,
} from "@/types/report";

type ReportsStatusBreakdownProps = {
  report: ReportData;
};

function formatStatus(
  value: string,
) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export function ReportsStatusBreakdown({
  report,
}: ReportsStatusBreakdownProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Quotations */}
      <div className="qufo-surface overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--qufo-border)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">
                Quotations
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Sales pipeline
                performance.
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-emerald-300">
                {
                  report
                    .quotations
                    .conversionRate
                }
                %
              </div>

              <div className="text-[11px] text-slate-600">
                conversion
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[var(--qufo-border)]">
          {report.quotations.byStatus.map(
            (item) => (
              <div
                key={
                  item.status
                }
                className="flex items-center justify-between px-5 py-3.5"
              >
                <span className="text-sm text-slate-400">
                  {formatStatus(
                    item.status,
                  )}
                </span>

                <span className="text-sm font-medium text-white">
                  {
                    item
                      ._count
                      ._all
                  }
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Jobs */}
      <div className="qufo-surface overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--qufo-border)] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">
                Jobs
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Production
                performance.
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-semibold text-cyan-300">
                {
                  report.jobs
                    .completionRate
                }
                %
              </div>

              <div className="text-[11px] text-slate-600">
                completion
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[var(--qufo-border)]">
          {report.jobs.byStatus.map(
            (item) => (
              <div
                key={
                  item.status
                }
                className="flex items-center justify-between px-5 py-3.5"
              >
                <span className="text-sm text-slate-400">
                  {formatStatus(
                    item.status,
                  )}
                </span>

                <span className="text-sm font-medium text-white">
                  {
                    item
                      ._count
                      ._all
                  }
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}