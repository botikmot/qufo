"use client";

import { BarChart3 } from "lucide-react";

import { ReportsDateFilter } from "@/components/reports/reports-date-filter";

import { ReportsOverview } from "@/components/reports/reports-overview";

import { ReportsPaymentMethods } from "@/components/reports/reports-payment-methods";

import { ReportsStatusBreakdown } from "@/components/reports/reports-status-breakdown";

import { ReportsTopCustomers } from "@/components/reports/reports-top-customers";

import { useReports } from "@/hooks/use-reports";

export default function ReportsPage() {
  const reports = useReports();

  return (
    <div className="min-w-0 space-y-6 pb-6">
      {/* =========================================================
          REPORT HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#07192B]">
        {/* Ambient glow */}

        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.04] blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-blue-500/[0.04] blur-3xl"
          aria-hidden="true"
        />

        {/* Decorative waves */}

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            className="absolute right-0 top-0 h-full w-3/4"
            fill="none"
          >
            <path
              d="M0 120 C120 20 200 30 320 105 S520 175 650 70 S820 15 1040 70"
              stroke="#06B6D4"
              strokeWidth="1"
              opacity="0.5"
            />

            <path
              d="M0 145 C140 65 230 50 370 125 S570 170 710 90 S850 40 1040 95"
              stroke="#0E7490"
              strokeWidth="0.8"
              opacity="0.45"
            />

            <circle cx="210" cy="65" r="3" fill="#06B6D4" opacity="0.55" />

            <circle cx="680" cy="88" r="3" fill="#06B6D4" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 p-6 sm:p-7">
          {/* Hero content */}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            {/* Title */}

            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/70">
                <BarChart3 size={13} />
                Analytics
              </p>

              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                  <BarChart3 size={22} strokeWidth={1.7} />
                </div>

                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Reports
                </h1>
              </div>

              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Track sales, production, payments, and customer activity across
                your workspace.
              </p>
            </div>

            {/* Period Filter */}

            <div className="min-w-0 xl:w-auto xl:min-w-[520px]">
              <ReportsDateFilter
                from={reports.from}
                to={reports.to}
                loading={reports.loading}
                onFromChange={reports.setFrom}
                onToChange={reports.setTo}
                onApply={reports.applyFilter}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ERROR
      ========================================================= */}

      {reports.error && (
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {reports.error}
        </div>
      )}

      {/* =========================================================
          LOADING
      ========================================================= */}

      {reports.loading && !reports.report ? (
        <div className="qufo-surface flex min-h-72 items-center justify-center rounded-2xl border border-[var(--qufo-border)] px-6 text-center">
          <div>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-cyan-400/[0.05] text-cyan-300">
              <BarChart3 size={22} className="animate-pulse" />
            </div>

            <p className="text-sm font-medium text-slate-300">
              Preparing your report...
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Analyzing sales, production, payments, and customer activity.
            </p>
          </div>
        </div>
      ) : reports.report ? (
        <div className="min-w-0 space-y-5">
          {/* =====================================================
              OVERVIEW
          ===================================================== */}

          <section className="min-w-0">
            <ReportsOverview overview={reports.report.overview} />
          </section>

          {/* =====================================================
              STATUS BREAKDOWN
          ===================================================== */}

          <section className="min-w-0">
            <ReportsStatusBreakdown report={reports.report} />
          </section>

          {/* =====================================================
              PAYMENT METHODS + TOP CUSTOMERS
          ===================================================== */}

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            <section className="min-w-0">
              <ReportsPaymentMethods payments={reports.report.payments} />
            </section>

            <section className="min-w-0">
              <ReportsTopCustomers customers={reports.report.topCustomers} />
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
