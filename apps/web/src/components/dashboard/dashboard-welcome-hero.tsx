"use client";

import { RefreshCw } from "lucide-react";

type DashboardWelcomeHeroProps = {
  organizationName: string;
  refreshing: boolean;
  onRefresh: () => void;
};

export function DashboardWelcomeHero({
  organizationName,
  refreshing,
  onRefresh,
}: DashboardWelcomeHeroProps) {
  return (
    <section className="qufo-welcome-hero relative overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
      {/* Animated background waves */}

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg
          viewBox="0 0 1200 240"
          preserveAspectRatio="none"
          className="h-full w-full"
          fill="none"
        >
          <defs>
            <linearGradient
              id="qufo-wave-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0891B2" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Main wave */}

          <path
            className="qufo-wave qufo-wave-one"
            d="M-100 155 C80 20 160 25 280 120 S480 200 620 80 S840 20 1000 100 S1160 180 1350 20"
            stroke="url(#qufo-wave-gradient)"
            strokeWidth="1.4"
          />

          {/* Second wave */}

          <path
            className="qufo-wave qufo-wave-two"
            d="M-100 185 C100 100 200 70 340 150 S550 225 720 110 S920 50 1080 135 S1200 160 1350 50"
            stroke="#0891B2"
            strokeWidth="0.9"
            opacity="0.5"
          />

          {/* Third wave */}

          <path
            className="qufo-wave qufo-wave-three"
            d="M-100 110 C100 180 200 35 400 80 S650 190 820 90 S1080 10 1350 100"
            stroke="#0E7490"
            strokeWidth="0.8"
            opacity="0.5"
          />

          {/* Fine flowing wave */}

          <path
            className="qufo-wave qufo-wave-four"
            d="M-100 205 C140 135 220 210 430 120 S670 20 860 100 S1080 210 1350 120"
            stroke="#164E63"
            strokeWidth="0.8"
            opacity="0.7"
          />

          {/* Glowing nodes */}

          <g className="qufo-wave-dots">
            <circle cx="145" cy="65" r="3.5" fill="#22D3EE" />

            <circle cx="350" cy="55" r="2.5" fill="#22D3EE" />

            <circle cx="520" cy="120" r="2" fill="#0891B2" />

            <circle cx="735" cy="80" r="3.5" fill="#22D3EE" />

            <circle cx="960" cy="150" r="3" fill="#22D3EE" />

            <circle cx="1110" cy="65" r="2.5" fill="#0891B2" />
          </g>
        </svg>
      </div>

      {/* Soft background glow */}

      <div
        className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-cyan-400/[0.045] blur-3xl"
        aria-hidden="true"
      />

      {/* Hero content */}

      <div className="relative z-10 flex min-h-[180px] flex-col justify-between gap-8 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-400">Welcome back,</p>

            <h1 className="mt-2 truncate text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {organizationName}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={onRefresh}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--qufo-border)] bg-black/10 px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : undefined}
            />
          </button>
        </div>

        {/* Bottom motto */}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Your flow matters
            </span>
          </div>

          <p className="hidden text-[10px] font-medium uppercase tracking-[0.24em] text-slate-600 sm:block">
            Ideas · Quotations · Results
          </p>
        </div>
      </div>
    </section>
  );
}
