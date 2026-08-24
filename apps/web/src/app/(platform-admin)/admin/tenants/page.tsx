"use client";

import {
  RefreshCw,
} from "lucide-react";

import {
  PlatformTenantsTable,
} from "@/components/platform-admin/platform-tenants-table";

import {
  PlatformTenantsToolbar,
} from "@/components/platform-admin/platform-tenants-toolbar";

import {
  usePlatformTenants,
} from "@/hooks/use-platform-tenants";

export default function PlatformTenantsPage() {
  const tenants =
    usePlatformTenants();

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
              QUFO Platform
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Tenants
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor businesses,
              subscriptions, and
              usage across QUFO.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void tenants.refresh()
            }
            disabled={
              tenants.loading
            }
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={
                tenants.loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        <PlatformTenantsToolbar
          search={
            tenants.search
          }
          status={
            tenants.status
          }
          onSearchChange={
            tenants.setSearch
          }
          onSearch={() =>
            void tenants.handleSearch()
          }
          onStatusChange={(
            status,
          ) =>
            void tenants.changeStatus(
              status,
            )
          }
        />

        {tenants.error && (
          <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            {tenants.error}
          </div>
        )}

        <PlatformTenantsTable
          tenants={
            tenants.tenants
          }
          pagination={
            tenants.pagination
          }
          loading={
            tenants.loading
          }
          onPrevious={() =>
            void tenants.previousPage()
          }
          onNext={() =>
            void tenants.nextPage()
          }
        />
      </div>
    </main>
  );
}