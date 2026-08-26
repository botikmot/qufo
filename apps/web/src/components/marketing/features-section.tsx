import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Link2,
  UsersRound,
  WalletCards,
} from "lucide-react";

const features = [
  {
    icon: UsersRound,
    title: "Customer Management",
    description:
      "Keep customer details, company information, contact records, and transaction history organized in one place.",
  },
  {
    icon: FileText,
    title: "Professional Quotations",
    description:
      "Create detailed quotations with items, quantities, pricing, discounts, taxes, notes, and terms.",
  },
  {
    icon: CheckCircle2,
    title: "Online Customer Approval",
    description:
      "Send customers a secure quotation link where they can approve or request changes without creating an account.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job & Production Tracking",
    description:
      "Convert approved quotations into jobs and monitor priorities, due dates, progress, and production status.",
  },
  {
    icon: WalletCards,
    title: "Payments & Balances",
    description:
      "Record deposits, partial payments, and full payments while QUFO automatically tracks remaining balances.",
  },
  {
    icon: Link2,
    title: "Customer Tracking Links",
    description:
      "Give customers a simple tracking link so they can follow job progress without repeatedly messaging your team.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Reports",
    description:
      "See active work, payment activity, outstanding balances, and business performance from one dashboard.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative border-t border-white/[0.05] py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[45rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Everything connected
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Everything you need to keep
            <span className="block text-slate-500">
              your workflow moving.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            QUFO brings the tools your business uses every day into one
            connected workflow instead of spreading information across
            messages, spreadsheets, and separate systems.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className={[
                  "group relative overflow-hidden rounded-3xl",
                  "border border-white/[0.07]",
                  "bg-white/[0.025] p-6",
                  "transition duration-300",
                  "hover:-translate-y-1",
                  "hover:border-emerald-400/20",
                  "hover:bg-white/[0.04]",
                  index === 6 ? "sm:col-span-2 lg:col-span-1" : "",
                ].join(" ")}
              >
                <div className="absolute -right-10 -top-10 size-28 rounded-full bg-emerald-400/[0.04] blur-3xl transition group-hover:bg-emerald-400/[0.08]" />

                <div className="relative">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
                    <Icon className="size-5 text-emerald-300" />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}