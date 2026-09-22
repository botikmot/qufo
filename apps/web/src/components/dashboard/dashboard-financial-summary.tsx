"use client";

import {
  BarChart3,
  TrendingUp,
  Wallet,
  CircleDollarSign,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { formatCurrency } from "@/utils/currency";

import type { DashboardResponse } from "@/types/dashboard";

type DashboardFinancialSummaryProps = {
  financials: DashboardResponse["stats"]["financials"];
};

type FinancialMetricProps = {
  label: string;
  value: string;
  accent?: "default" | "success" | "warning";
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

function FinancialMetric({
  label,
  value,
  accent = "default",
  icon: Icon,
}: FinancialMetricProps) {
  const valueColor =
    accent === "success"
      ? "text-emerald-300"
      : accent === "warning"
        ? "text-amber-300"
        : "text-slate-100";

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center gap-1.5 text-slate-500">
        <Icon size={13} />

        <p className="truncate text-[10px] font-medium uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p
        className={[
          "truncate text-base font-semibold tracking-tight sm:text-lg",
          valueColor,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function formatChartCurrency(value: number) {
  if (value >= 1_000_000) {
    return `₱${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `₱${(value / 1_000).toFixed(0)}K`;
  }

  return `₱${value.toFixed(0)}`;
}

function RevenueTooltip({
  active,
  payload,
  label,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0]?.value ?? 0);

  return (
    <div className="rounded-xl border border-cyan-400/30 bg-[#071625]/95 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-cyan-300">
        {formatCurrency(value, "PHP")}
      </p>
    </div>
  );
}

export function DashboardFinancialSummary({
  financials,
}: DashboardFinancialSummaryProps) {
  const monthlyRevenue = financials.monthlyRevenue ?? [];

  const chartData = monthlyRevenue.map((item) => ({
    month: new Date(2026, item.month - 1, 1).toLocaleString("en-US", {
      month: "short",
    }),

    revenue: Number(item.revenue),
  }));

  const latestRevenue = chartData[chartData.length - 1]?.revenue ?? 0;

  return (
    <div className="qufo-surface overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3 border-b border-[var(--qufo-border)] px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
            <BarChart3 size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-200">
              Financial Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Revenue, collections, and outstanding balance.
            </p>
          </div>
        </div>

        <div className="shrink-0 rounded-lg border border-[var(--qufo-border)] bg-white/[0.02] px-3 py-2 text-[10px] text-slate-400">
          This Year
        </div>
      </div>

      {/* FINANCIAL METRICS */}

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-[var(--qufo-border)] p-5 sm:grid-cols-4">
        <FinancialMetric
          label="Revenue This Month"
          value={formatCurrency(
            financials.revenueThisMonth,
            financials.currency,
          )}
          icon={TrendingUp}
          accent="success"
        />

        <FinancialMetric
          label="Total Job Value"
          value={formatCurrency(financials.totalJobValue, financials.currency)}
          icon={CircleDollarSign}
        />

        <FinancialMetric
          label="Collected"
          value={formatCurrency(financials.totalPaid, financials.currency)}
          icon={Wallet}
          accent="success"
        />

        <FinancialMetric
          label="Outstanding"
          value={formatCurrency(
            financials.outstandingBalance,
            financials.currency,
          )}
          icon={ArrowUpRight}
          accent={
            Number(financials.outstandingBalance) > 0 ? "warning" : "default"
          }
        />
      </div>

      {/* REVENUE CHART */}

      <div className="px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Revenue Trend</p>

            <p className="mt-1 text-[10px] text-slate-600">
              Monthly collected payments
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-600">Latest</p>

            <p className="text-xs font-semibold text-cyan-300">
              {formatCurrency(latestRevenue, financials.currency)}
            </p>
          </div>
        </div>

        <div className="h-[220px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 12,
                  right: 8,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="qufoRevenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#06d6f5" stopOpacity={0.25} />

                    <stop offset="100%" stopColor="#06d6f5" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(148,163,184,0.10)"
                  vertical={false}
                  strokeDasharray="3 5"
                />

                <XAxis
                  dataKey="month"
                  axisLine={{
                    stroke: "rgba(148,163,184,0.20)",
                  }}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                  tickFormatter={formatChartCurrency}
                  width={45}
                />

                <Tooltip
                  content={<RevenueTooltip />}
                  cursor={{
                    stroke: "rgba(34,211,238,0.25)",
                    strokeDasharray: "4 4",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06d6f5"
                  strokeWidth={2.5}
                  fill="url(#qufoRevenueGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#06d6f5",
                    stroke: "#082032",
                    strokeWidth: 3,
                  }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-600">
              No revenue data available.
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between border-t border-[var(--qufo-border)] px-5 py-3">
        <p className="text-[10px] text-slate-600">Current financial snapshot</p>

        <div className="flex items-center gap-1.5 text-[10px] text-emerald-300/80">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Updated data
        </div>
      </div>
    </div>
  );
}
