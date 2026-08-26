import {
  ArrowRight,
  CheckCircle2,
  Link2,
  MessageSquareText,
  RefreshCcw,
} from "lucide-react";

export function TrackingSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10rem] top-1/2 size-[34rem] -translate-y-1/2 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Customer experience
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Keep customers updated.
            <span className="block text-slate-500">
              Without repeated follow-ups.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Give every customer a secure tracking link where they can follow
            the progress of their order without needing a QUFO account.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                <Link2 className="size-4 text-emerald-300" />
              </div>

              <div>
                <h3 className="font-medium text-white">
                  Share a simple tracking link
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  No customer login or account registration required.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                <RefreshCcw className="size-4 text-cyan-300" />
              </div>

              <div>
                <h3 className="font-medium text-white">
                  Progress updates automatically
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  As your team updates production, customers see the latest
                  progress and status.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                <MessageSquareText className="size-4 text-blue-300" />
              </div>

              <div>
                <h3 className="font-medium text-white">
                  Add customer-facing messages
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Keep customers informed without exposing your internal notes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual mockup */}
        <div className="relative">
          <div className="absolute inset-x-10 bottom-[-2rem] h-24 rounded-full bg-emerald-400/10 blur-[70px]" />

          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 shadow-[0_30px_100px_rgba(0,0,0,.5)] backdrop-blur-xl">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#081421]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
                      Order Tracking
                    </p>

                    <h3 className="mt-1 font-semibold text-white">
                      Tarpaulin Printing
                    </h3>
                  </div>

                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    In Production
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Current progress</p>

                    <div className="mt-1 text-4xl font-semibold tracking-tight text-white">
                      70%
                    </div>
                  </div>

                  <CheckCircle2 className="size-7 text-emerald-400" />
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                </div>

                <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-600">
                    Latest update
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Your order is currently in production and is progressing as
                    scheduled.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-emerald-400" />

                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm text-slate-300">
                        Order confirmed
                      </span>

                      <span className="text-xs text-slate-600">Completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-emerald-400" />

                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm text-slate-300">
                        Production started
                      </span>

                      <span className="text-xs text-slate-600">Completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,.7)]" />

                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        Production
                      </span>

                      <span className="text-xs text-cyan-300">In progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-5 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="flex size-11 items-center justify-center rounded-full border border-emerald-400/20 bg-[#07111f] shadow-xl">
              <ArrowRight className="size-5 text-emerald-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}