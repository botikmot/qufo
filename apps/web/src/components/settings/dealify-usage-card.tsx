import { CalendarDays, FileText } from "lucide-react";

type DealifyUsageCardProps = {
  tier: "TIER_2" | "TIER_3";
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
};

export function DealifyUsageCard({
  tier,
  used,
  limit,
  remaining,
  resetsAt,
}: DealifyUsageCardProps) {
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  const resetDate = new Date(resetsAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isExhausted = remaining === 0;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Dealify {tier === "TIER_2" ? "Tier 2" : "Tier 3"}
          </p>

          <h3 className="mt-1 text-lg font-semibold">Quotation Credits</h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg border">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{remaining}</p>

            <p className="text-sm text-muted-foreground">
              of {limit} remaining
            </p>
          </div>

          <p className="text-sm text-muted-foreground">{used} used</p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />

        <span>Credits renew {resetDate}</span>
      </div>

      {isExhausted && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          Your monthly quotation credit limit has been reached.
        </div>
      )}
    </div>
  );
}
