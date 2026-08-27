"use client";

import {
  BarChart3,
} from "lucide-react";

import {
  ReportsDateFilter,
} from "@/components/reports/reports-date-filter";

import {
  ReportsOverview,
} from "@/components/reports/reports-overview";

import {
  ReportsPaymentMethods,
} from "@/components/reports/reports-payment-methods";

import {
  ReportsStatusBreakdown,
} from "@/components/reports/reports-status-breakdown";

import {
  ReportsTopCustomers,
} from "@/components/reports/reports-top-customers";

import {
  useReports,
} from "@/hooks/use-reports";

export default function ReportsPage() {
  const reports =
    useReports();

  console.log('reports::', reports)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
          <BarChart3
            size={14}
          />

          Analytics
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Reports
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track sales,
          production, payments,
          and customer activity.
        </p>
      </div>

      <ReportsDateFilter
        from={reports.from}
        to={reports.to}
        loading={
          reports.loading
        }
        onFromChange={
          reports.setFrom
        }
        onToChange={
          reports.setTo
        }
        onApply={
          reports.applyFilter
        }
      />

      {reports.error && (
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {reports.error}
        </div>
      )}

      {reports.loading &&
      !reports.report ? (
        <div className="qufo-surface rounded-3xl p-12 text-center text-sm text-slate-500">
          Loading report...
        </div>
      ) : reports.report ? (
        <>
          <ReportsOverview
            overview={
              reports.report
                .overview
            }
          />

          <ReportsStatusBreakdown
            report={
              reports.report
            }
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <ReportsPaymentMethods
              payments={
                reports.report
                  .payments
              }
            />

            <ReportsTopCustomers
              customers={
                reports.report
                  .topCustomers
              }
            />
          </div>
        </>
      ) : null}
    </div>
  );
}