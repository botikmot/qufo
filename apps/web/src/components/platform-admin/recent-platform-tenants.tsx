import Link from "next/link";

import {
  ArrowRight,
  Building2,
} from "lucide-react";

import type {
  PlatformRecentTenant,
} from "@/types/platform-admin";

type RecentPlatformTenantsProps = {
  tenants: PlatformRecentTenant[];
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

function getSubscriptionLabel(
  tenant: PlatformRecentTenant,
) {
  if (!tenant.subscription) {
    return "No subscription";
  }

  return tenant.subscription.status.replace(
    "_",
    " ",
  );
}

function getExpiryLabel(
  tenant: PlatformRecentTenant,
) {
  if (
    tenant.daysRemaining ===
      null ||
    tenant.daysRemaining ===
      undefined
  ) {
    return "—";
  }

  if (
    tenant.daysRemaining < 0
  ) {
    return "Expired";
  }

  if (
    tenant.daysRemaining ===
    0
  ) {
    return "Ends today";
  }

  return `${tenant.daysRemaining}d remaining`;
}

export function RecentPlatformTenants({
  tenants,
}: RecentPlatformTenantsProps) {
  return (
    <section className="qufo-surface overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-semibold text-white">
            Recent tenants
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest businesses registered
            on QUFO.
          </p>
        </div>

        <Link
          href="/admin/tenants"
          className="flex shrink-0 items-center gap-2 text-sm text-emerald-300 transition hover:text-emerald-200"
        >
          View all
          <ArrowRight size={15} />
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Building2
            size={28}
            className="mx-auto text-slate-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            No tenants registered yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--qufo-border)] text-left">
                <th className="px-6 py-3 text-xs font-medium text-slate-500">
                  Business
                </th>

                <th className="px-6 py-3 text-xs font-medium text-slate-500">
                  Owner
                </th>

                <th className="px-6 py-3 text-xs font-medium text-slate-500">
                  Status
                </th>

                <th className="px-6 py-3 text-xs font-medium text-slate-500">
                  Expiry
                </th>

                <th className="px-6 py-3 text-xs font-medium text-slate-500">
                  Registered
                </th>

                <th className="w-12" />
              </tr>
            </thead>

            <tbody>
              {tenants.map(
                (tenant) => (
                  <tr
                    key={
                      tenant.id
                    }
                    className="border-b border-[var(--qufo-border)] last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">
                        {tenant.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {tenant.businessType ??
                          "Business"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {tenant.owner
                          ?.name ??
                          "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {tenant.owner
                          ?.email ??
                          ""}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">
                        {getSubscriptionLabel(
                          tenant,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {getExpiryLabel(
                        tenant,
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
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
      )}
    </section>
  );
}