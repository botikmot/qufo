import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  PhilippinePeso,
  WalletCards,
} from "lucide-react";

export function ReportsSection() {
  return (
    <section className="relative border-y border-white/[0.05] bg-white/[0.012] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* dashboard visual */}
          <div className="order-2 lg:order-1">
            <div className="rounded-[2rem] border border-white/[0.08] bg-[#091522]/80 p-4 shadow-[0_30px_90px_rgba(0,0,0,.45)]">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  icon={BriefcaseBusiness}
                  label="Active Jobs"
                  value="18"
                  detail="+4 this month"
                />

                <MetricCard
                  icon={PhilippinePeso}
                  label="Revenue"
                  value="₱84,500"
                  detail="+12.4%"
                />

                <MetricCard
                  icon={WalletCards}
                  label="Outstanding"
                  value="₱21,300"
                  detail="6 open balances"
                />

                <MetricCard
                  icon={BarChart3}
                  label="Completion Rate"
                  value="92%"
                  detail="+5.2%"
                />
              </div>

              <div className="mt-3 rounded-3xl border border-white/[0.06] bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
                      Business activity
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      Monthly overview
                    </p>
                  </div>

                  <ArrowUpRight className="size-5 text-emerald-300" />
                </div>

                <div className="mt-8 flex h-36 items-end gap-2">
                  {[36, 48, 42, 68, 58, 78, 65, 88, 73, 93, 81, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500/20 to-emerald-400/70"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Business visibility
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Know what&apos;s happening
              <span className="block text-slate-500">
                without chasing updates.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
              QUFO gives owners and managers a clearer picture of work,
              payments, balances, and business activity without manually
              checking multiple records.
            </p>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500">
              See which jobs are active, which payments have been collected,
              what customers still owe, and how work is progressing from one
              centralized dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type MetricCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/[0.08]">
          <Icon className="size-4 text-emerald-300" />
        </div>

        <span className="text-[11px] text-emerald-300">{detail}</span>
      </div>

      <p className="mt-5 text-xs uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}