import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe2,
  MapPin,
  Sparkles,
} from "lucide-react";

const includedFeatures = [
  "Customer management",
  "Professional quotations",
  "Online quotation approval",
  "Job & production tracking",
  "Payments & balance tracking",
  "Customer tracking links",
  "Dashboard & reports",
  "Business settings",
];

export function TrialCtaSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-[140px]" />

        <div className="absolute right-[-10rem] top-[15%] h-72 w-72 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-2 text-xs font-medium text-emerald-300">
            <Sparkles className="size-3.5" />
            Early Access Pricing
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Simple pricing.
            <span className="block text-slate-500">
              Everything included.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Try the complete QUFO workflow free for 30 days.
            Continue only if it works for your business.
          </p>
        </div>

        {/* Main pricing card */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.07] to-white/[0.025] p-6 shadow-[0_40px_100px_rgba(0,0,0,.45)] sm:p-8">
            {/* glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-emerald-400/10 blur-[90px]" />

            <div className="relative">
              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-300" />

                    <p className="text-base font-semibold text-white">
                      QUFO Business
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Complete workflow management for your business.
                  </p>
                </div>

                <div className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  First 30 Days Free
                </div>
              </div>

              {/* Prices */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {/* Philippines */}
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    <MapPin className="size-3.5 text-emerald-400" />
                    Philippines
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                      ₱499
                    </span>

                    <span className="pb-1 text-sm text-slate-500">
                      / month
                    </span>
                  </div>
                </div>

                {/* International */}
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    <Globe2 className="size-3.5 text-cyan-400" />
                    International
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                      $9
                    </span>

                    <span className="pb-1 text-sm text-slate-500">
                      / month
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-sm text-slate-500">
                Billing starts only after your 30-day free trial.
              </p>

              <div className="my-8 h-px bg-white/[0.07]" />

              {/* Features */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Everything included
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {includedFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="flex min-w-0 items-start gap-2.5 text-sm text-slate-300"
                    >
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                        <Check className="size-3 text-emerald-300" />
                      </div>

                      <span className="leading-5">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-semibold text-[#04110d] shadow-[0_0_40px_rgba(52,211,153,.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Start Your 30-Day Free Trial
                <ArrowRight className="size-4" />
              </Link>

              {/* Trust */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
                <span>No credit card required</span>

                <span className="hidden sm:inline">•</span>

                <span>No setup fee</span>

                <span className="hidden sm:inline">•</span>

                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* reassurance */}
          <div className="mt-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 text-center">
            <p className="text-xs leading-6 text-slate-500 sm:text-sm">
              <span className="font-medium text-slate-300">
                Early Access Pricing.
              </span>{" "}
              Get full access to QUFO while we continue improving the platform
              with feedback from real businesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}