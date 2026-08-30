import Link from "next/link";
import {
  ArrowRight,
  Check,
  CirclePlay,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[55rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="absolute right-[-12rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/8 blur-[120px]" />

        <div className="absolute left-[-12rem] top-[26rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-2 text-xs font-medium text-emerald-300 sm:text-sm">
            <Sparkles className="size-4" />
            One workflow. From quotation to completion.
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Run your entire workflow.
            <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Without the chaos.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Manage customers, quotations, approvals, jobs, payments, and
            customer tracking in one connected workspace built for growing
            service and production businesses.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#04110d] shadow-[0_0_40px_rgba(52,211,153,.20)] transition hover:-translate-y-0.5 hover:bg-emerald-300 sm:w-auto"
            >
              Start Free for 30 Days
              <ArrowRight className="size-4" />
            </Link>

            <a
              href="#demo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07] sm:w-auto"
            >
              <CirclePlay className="size-4" />
              Watch 3-Minute Demo
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" />
              No credit card
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" />
              Quick setup
            </span>

            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-400" />
              30-day trial
            </span>
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-14 max-w-6xl sm:mt-16 lg:mt-20">
          <div className="absolute inset-x-16 bottom-[-3rem] h-24 rounded-full bg-emerald-400/10 blur-[70px]" />

          <div className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-2 shadow-[0_40px_100px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-3">
            <div className="overflow-hidden rounded-[1.3rem] border border-white/[0.06] bg-[#07111f]">
              <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] bg-white/[0.025] px-4">
                <span className="size-2.5 rounded-full bg-white/10" />
                <span className="size-2.5 rounded-full bg-white/10" />
                <span className="size-2.5 rounded-full bg-white/10" />

                <div className="mx-auto hidden rounded-md border border-white/[0.06] bg-black/10 px-16 py-1 text-[10px] text-slate-600 sm:block">
                  QUFO Workspace
                </div>
              </div>

              <div className="relative overflow-hidden bg-[#07111f]">
                <Image
                  src="/images/qufo-dashboard2.png"
                  alt="QUFO business management dashboard showing customers, quotations, jobs, payments, workflow status, and financial overview"
                  width={1741}
                  height={864}
                  priority
                  className="h-auto w-full"
                />

                {/* subtle bottom fade */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#07111f]/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* floating cards */}
          <div className="absolute -left-4 top-1/3 hidden rounded-2xl border border-white/10 bg-[#0b1727]/90 p-4 shadow-2xl backdrop-blur-xl lg:block">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Job Progress
            </div>

            <div className="mt-1 text-xl font-semibold text-white">70%</div>

            <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[70%] rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="absolute -right-5 bottom-1/4 hidden rounded-2xl border border-white/10 bg-[#0b1727]/90 p-4 shadow-2xl backdrop-blur-xl lg:block">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Outstanding
            </div>

            <div className="mt-1 text-xl font-semibold text-white">₱20,311.50</div>

            <div className="mt-1 text-xs text-emerald-300">
              Payments tracked automatically
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}