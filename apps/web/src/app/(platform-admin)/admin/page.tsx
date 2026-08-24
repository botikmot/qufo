"use client";

import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  PlatformAdminOverview,
} from "@/components/platform-admin/platform-admin-overview";

import {
  RecentPlatformTenants,
} from "@/components/platform-admin/recent-platform-tenants";

import {
  usePlatformAdminDashboard,
} from "@/hooks/use-platform-admin-dashboard";

export default function PlatformAdminPage() {
  const dashboard =
    usePlatformAdminDashboard();

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
              QUFO Platform
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor businesses,
              subscriptions, trials, and
              platform activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void dashboard.refresh()
            }
            disabled={
              dashboard.loading
            }
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={
                dashboard.loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {dashboard.loading &&
        !dashboard.data ? (
          <div className="qufo-surface flex min-h-64 items-center justify-center rounded-2xl">
            <div className="text-center">
              <LoaderCircle
                size={24}
                className="mx-auto animate-spin text-emerald-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading platform
                dashboard...
              </p>
            </div>
          </div>
        ) : dashboard.error ? (
          <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            {dashboard.error}
          </div>
        ) : dashboard.data ? (
          <div className="space-y-6">
            <PlatformAdminOverview
              stats={
                dashboard.data
                  .stats
              }
            />

            <RecentPlatformTenants
              tenants={
                dashboard.data
                  .recentTenants
              }
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}