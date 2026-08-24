import Link from "next/link";

import {
  ArrowRight,
  Building2,
  LoaderCircle,
} from "lucide-react";

import type {
  PlatformTenant,
  PlatformTenantsResponse,
} from "@/types/platform-admin";

type PlatformTenantsTableProps = {
  tenants:
    PlatformTenant[];

  pagination:
    PlatformTenantsResponse["pagination"] | null;

  loading: boolean;

  onPrevious: () => void;
  onNext: () => void;
};

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

function getExpiryText(
  tenant: PlatformTenant,
) {
  const days =
    tenant.subscription
      ?.daysRemaining;

  if (
    days === null ||
    days === undefined
  ) {
    return "—";
  }

  if (days < 0) {
    return `Expired ${Math.abs(
      days,
    )}d ago`;
  }

  if (days === 0) {
    return "Ends today";
  }

  return `${days} days`;
}

export function PlatformTenantsTable({
  tenants,
  pagination,
  loading,
  onPrevious,
  onNext,
}: PlatformTenantsTableProps) {
  return (
    <section className="qufo-surface overflow-hidden rounded-2xl">
      {loading &&
      tenants.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-center">
            <LoaderCircle
              size={24}
              className="mx-auto animate-spin text-emerald-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading tenants...
            </p>
          </div>
        </div>
      ) : tenants.length ===
        0 ? (
        <div className="px-6 py-16 text-center">
          <Building2
            size={30}
            className="mx-auto text-slate-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            No tenants found.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-[var(--qufo-border)] text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Business
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Owner
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Activity
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Plan
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Expires
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Registered
                  </th>

                  <th className="w-14" />
                </tr>
              </thead>

              <tbody>
                {tenants.map(
                  (tenant) => (
                    <tr
                      key={
                        tenant.id
                      }
                      className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.015]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-200">
                          {
                            tenant.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {tenant.businessType ??
                            "Business"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-300">
                          {tenant
                            .owner
                            ?.name ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {tenant
                            .owner
                            ?.email ??
                            ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-300">
                          {
                            tenant
                              .usage
                              .jobs
                          }{" "}
                          jobs
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {
                            tenant
                              .usage
                              .customers
                          }{" "}
                          customers
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {tenant
                          .subscription
                          ?.plan ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">
                          {tenant
                            .subscription
                            ?.status.replace(
                              "_",
                              " ",
                            ) ??
                            "NONE"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {getExpiryText(
                          tenant,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          tenant.createdAt,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/tenants/${tenant.id}`}
                          className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          <ArrowRight
                            size={
                              16
                            }
                          />
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-600">
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.pages
                }{" "}
                ·{" "}
                {
                  pagination.total
                }{" "}
                tenants
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    onPrevious
                  }
                  disabled={
                    !pagination.hasPreviousPage ||
                    loading
                  }
                  className="rounded-xl border border-[var(--qufo-border)] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={
                    onNext
                  }
                  disabled={
                    !pagination.hasNextPage ||
                    loading
                  }
                  className="rounded-xl border border-[var(--qufo-border)] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}