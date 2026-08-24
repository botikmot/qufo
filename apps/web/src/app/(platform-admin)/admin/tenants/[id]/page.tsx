"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CircleUserRound,
  CreditCard,
  FileText,
  LoaderCircle,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";

import {
  use,
} from "react";

import {
  RenewSubscriptionModal,
} from "@/components/platform-admin/renew-subscription-modal";

import {
  usePlatformTenant,
} from "@/hooks/use-platform-tenant";

type PlatformTenantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

export default function PlatformTenantPage({
  params,
}: PlatformTenantPageProps) {
  const {
    id,
  } = use(params);

  const platformTenant =
    usePlatformTenant(id);

  const tenant =
    platformTenant.tenant;

  if (
    platformTenant.loading &&
    !tenant
  ) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={26}
            className="mx-auto animate-spin text-emerald-300"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading tenant...
          </p>
        </div>
      </main>
    );
  }

  if (
    platformTenant.error &&
    !tenant
  ) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {
            platformTenant.error
          }
        </div>
      </main>
    );
  }

  if (!tenant) {
    return null;
  }

  const subscription =
    tenant.subscription;

  const expiry =
    subscription
      ?.expiresAt ??
    subscription
      ?.currentPeriodEnd ??
    subscription
      ?.trialEndsAt ??
    null;

  const usageCards = [
    {
      label: "Members",
      value:
        tenant.usage.members,
      icon: Users,
    },
    {
      label: "Customers",
      value:
        tenant.usage.customers,
      icon: CircleUserRound,
    },
    {
      label: "Quotations",
      value:
        tenant.usage.quotations,
      icon: FileText,
    },
    {
      label: "Jobs",
      value:
        tenant.usage.jobs,
      icon: Wrench,
    },
    {
      label: "Payments",
      value:
        tenant.usage.payments,
      icon: CreditCard,
    },
  ];

  return (
    <>
      <main className="min-h-dvh">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/admin/tenants"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <ArrowLeft
                size={16}
              />

              Back to tenants
            </Link>
          </div>

          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-300">
                <Building2
                  size={21}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
                  Tenant
                </p>

                <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {tenant.name}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {tenant.businessType ??
                    "Business"}{" "}
                  · Registered{" "}
                  {formatDate(
                    tenant.createdAt,
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void platformTenant.refresh()
                }
                className="flex items-center gap-2 rounded-xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05]"
              >
                <RefreshCw
                  size={15}
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={
                  platformTenant.openRenew
                }
                className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
              >
                <CalendarClock
                  size={16}
                />

                Renew subscription
              </button>
            </div>
          </div>

          {platformTenant.error && (
            <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
              {
                platformTenant.error
              }
            </div>
          )}

          {/* Usage */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {usageCards.map(
              (card) => {
                const Icon =
                  card.icon;

                return (
                  <div
                    key={
                      card.label
                    }
                    className="qufo-surface rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {
                          card.label
                        }
                      </p>

                      <Icon
                        size={17}
                        className="text-cyan-300"
                      />
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-white">
                      {
                        card.value
                      }
                    </p>
                  </div>
                );
              },
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            {/* Business details */}
            <section className="qufo-surface overflow-hidden rounded-2xl">
              <div className="border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-white">
                  Business information
                </h2>
              </div>

              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <DetailItem
                  label="Business name"
                  value={
                    tenant.name
                  }
                />

                <DetailItem
                  label="Business type"
                  value={
                    tenant.businessType
                  }
                />

                <DetailItem
                  label="Email"
                  value={
                    tenant.email
                  }
                />

                <DetailItem
                  label="Phone"
                  value={
                    tenant.phone
                  }
                />

                <DetailItem
                  label="Address"
                  value={
                    tenant.address
                  }
                />

                <DetailItem
                  label="Tenant status"
                  value={
                    tenant.status
                  }
                />
              </div>
            </section>

            {/* Subscription */}
            <section className="qufo-surface overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-white">
                  Subscription
                </h2>

                {subscription && (
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-xs text-emerald-300">
                    {
                      subscription.status
                    }
                  </span>
                )}
              </div>

              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <DetailItem
                  label="Plan"
                  value={
                    subscription
                      ?.plan
                  }
                />

                <DetailItem
                  label="Current expiry"
                  value={
                    formatDate(
                      expiry,
                    )
                  }
                />

                <DetailItem
                  label="Trial started"
                  value={
                    formatDate(
                      subscription
                        ?.trialStartedAt,
                    )
                  }
                />

                <DetailItem
                  label="Trial ends"
                  value={
                    formatDate(
                      subscription
                        ?.trialEndsAt,
                    )
                  }
                />

                <DetailItem
                  label="Period start"
                  value={
                    formatDate(
                      subscription
                        ?.currentPeriodStart,
                    )
                  }
                />

                <DetailItem
                  label="Period end"
                  value={
                    formatDate(
                      subscription
                        ?.currentPeriodEnd,
                    )
                  }
                />

                <DetailItem
                  label="Days remaining"
                  value={
                    subscription
                      ?.daysRemaining !==
                      null &&
                    subscription
                      ?.daysRemaining !==
                      undefined
                      ? String(
                          subscription.daysRemaining,
                        )
                      : "—"
                  }
                />
              </div>
            </section>
          </div>

          {/* Owner */}
          <section className="qufo-surface mt-6 overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-white">
                Owner
              </h2>
            </div>

            <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
              <DetailItem
                label="Name"
                value={
                  tenant.owner?.name
                }
              />

              <DetailItem
                label="Email"
                value={
                  tenant.owner?.email
                }
              />

              <DetailItem
                label="Phone"
                value={
                  tenant.owner?.phone
                }
              />

              <DetailItem
                label="Last login"
                value={
                  tenant.owner
                    ?.lastLoginAt
                    ? formatDate(
                        tenant.owner
                          .lastLoginAt,
                      )
                    : "Never"
                }
              />
            </div>
          </section>

          {/* Members */}
          <section className="qufo-surface mt-6 overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-white">
                Members
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Active users in this
                tenant workspace.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--qufo-border)] text-left">
                    <th className="px-6 py-3 text-xs font-medium text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-slate-500">
                      Joined
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-slate-500">
                      Last login
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tenant.members.map(
                    (member) => (
                      <tr
                        key={
                          member.id
                        }
                        className="border-b border-[var(--qufo-border)] last:border-0"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-300">
                            {
                              member
                                .user
                                .name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {
                              member
                                .user
                                .email
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-400">
                          {
                            member.role
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-400">
                          {
                            member
                              .user
                              .status
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            member.joinedAt,
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {member
                            .user
                            .lastLoginAt
                            ? formatDate(
                                member
                                  .user
                                  .lastLoginAt,
                              )
                            : "Never"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {platformTenant.renewOpen && (
        <RenewSubscriptionModal
          tenant={tenant}
          loading={
            platformTenant.renewing
          }
          onClose={
            platformTenant.closeRenew
          }
          onConfirm={
            platformTenant.renew
          }
        />
      )}
    </>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;

  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
}