import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  UserRound,
  WalletCards,
} from "lucide-react";

const steps = [
  {
    icon: UserRound,
    number: "01",
    title: "Customer",
    description: "Keep client details and transaction history organized.",
  },
  {
    icon: FileText,
    number: "02",
    title: "Quotation",
    description: "Prepare professional quotations and send them for review.",
  },
  {
    icon: CheckCircle2,
    number: "03",
    title: "Approval",
    description: "Customers can approve or request changes online.",
  },
  {
    icon: BriefcaseBusiness,
    number: "04",
    title: "Job",
    description: "Turn approved quotations directly into production jobs.",
  },
  {
    icon: WalletCards,
    number: "05",
    title: "Payment",
    description: "Track deposits, partial payments, and remaining balances.",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="relative border-t border-white/[0.05] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            One connected workflow
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Stop managing your business
            <span className="block text-slate-500">
              across disconnected tools.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            QUFO connects the entire customer journey, so information moves
            forward instead of being entered again and again.
          </p>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.04]"
              >
                <div className="absolute right-4 top-3 text-5xl font-black text-white/[0.025]">
                  {step.number}
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                  <Icon className="size-5 text-emerald-300" />
                </div>

                <h3 className="mt-5 font-semibold text-white">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-4xl text-center text-sm font-medium text-slate-500">
          Customer
          <span className="mx-2 text-emerald-400">→</span>
          Quotation
          <span className="mx-2 text-emerald-400">→</span>
          Approval
          <span className="mx-2 text-emerald-400">→</span>
          Job
          <span className="mx-2 text-emerald-400">→</span>
          Payment
          <span className="mx-2 text-emerald-400">→</span>
          Completion
        </div>
      </div>
    </section>
  );
}