"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import type {
  SubscriptionBillingSummary,
} from "@/types/subscription";

type Props = {
  enabled: boolean;

  billing:
    SubscriptionBillingSummary;

  redeeming: boolean;

  success:
    | string
    | null;

  onRedeem: (
    code: string,
  ) => Promise<boolean>;
};

function formatTier(
  tier:
    | string
    | null,
) {
  if (!tier) {
    return "Lifetime";
  }

  return tier.replace(
    "TIER_",
    "Tier ",
  );
}

export function AppSumoRedemptionCard({
  enabled,
  billing,
  redeeming,
  success,
  onRedeem,
}: Props) {
  const [
    code,
    setCode,
  ] = useState("");

  if (!enabled) {
    return null;
  }

  const subscription =
    billing.subscription;

  const lifetime =
    subscription.source ===
      "APPSUMO" &&
    subscription.accessType ===
      "LIFETIME";

  const canUpgrade =
    lifetime &&
    subscription.status ===
      "ACTIVE" &&
    subscription.appSumoTier !==
      "TIER_3";

  const upgradePlaceholder =
    subscription.appSumoTier ===
    "TIER_1"
      ? "Enter a Tier 2 or Tier 3 code"
      : "Enter a Tier 3 code";

  const entitlements = billing.entitlements;

  const customerEmailUsage = billing.customerEmailUsage;

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const redeemed =
      await onRedeem(
        code,
      );

    if (redeemed) {
      setCode("");
    }
  }

  if (lifetime) {
    return (
        <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">

          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.1] text-emerald-300">
              <Sparkles
                size={18}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-emerald-200">
                  AppSumo lifetime access
                </h3>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
                  {formatTier(
                    subscription
                      .appSumoTier,
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your workspace has
                permanent access to
                QUFO under your AppSumo
                license.
              </p>
            </div>

            <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />
          </div>

        {canUpgrade && (
          <div className="mt-5 border-t border-emerald-400/10 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.09] text-violet-300">
                <KeyRound
                  size={16}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-200">
                  Upgrade AppSumo tier
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Redeem a higher-tier
                  AppSumo code to increase
                  your workspace limits.
                </p>
              </div>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <input
                value={code}
                disabled={redeeming}
                onChange={(event) =>
                  setCode(
                    event.target.value
                      .toUpperCase(),
                  )
                }
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder={
                  upgradePlaceholder
                }
                className="qufo-input min-w-0 flex-1 font-mono text-sm uppercase"
              />

              <button
                type="submit"
                disabled={
                  redeeming ||
                  code.trim().length <
                    8
                }
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {redeeming ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles
                    size={16}
                  />
                )}

                {redeeming
                  ? "Upgrading..."
                  : "Upgrade tier"}
              </button>
            </form>
          </div>
        )}

        {subscription.appSumoTier ===
          "TIER_3" && (
          <div className="mt-5 border-t border-emerald-400/10 pt-4 text-xs text-emerald-300/80">
            Highest AppSumo tier
            active.
          </div>
        )}

        {success && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2
              size={14}
            />

            {success}
          </div>
        )}

          {entitlements && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {/* <Entitlement
                label="Team members"
                value={String(
                  entitlements
                    .maxMembers,
                )}
              /> */}

              <Entitlement
                label="Storage"
                value={
                  billing.storageUsage
                    ? `${formatBytes(
                        billing
                          .storageUsage
                          .usedBytes,
                      )} of ${formatBytes(
                        billing
                          .storageUsage
                          .limitBytes,
                      )} used`
                    : `${formatBytes(
                        entitlements
                          .maxStorageBytes,
                      )} available`
                }
                detail={
                  billing.storageUsage
                    ? `${formatBytes(
                        billing
                          .storageUsage
                          .remainingBytes,
                      )} remaining`
                    : undefined
                }
              />

              <Entitlement
                label="Customer emails"
                value={
                  customerEmailUsage
                    ? `${customerEmailUsage.used.toLocaleString()} of ${customerEmailUsage.limit.toLocaleString()} used`
                    : `${entitlements.monthlyCustomerEmailLimit.toLocaleString()}/month`
                }
                detail={
                  customerEmailUsage
                    ? `${customerEmailUsage.remaining.toLocaleString()} remaining this month`
                    : undefined
                }
              />
            </div>
          )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.09] text-violet-300">
          <KeyRound
            size={18}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-violet-200">
            AppSumo redemption
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Enter your AppSumo code
            to activate lifetime
            access for this workspace.
          </p>
        </div>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={code}
          disabled={redeeming}
          onChange={(event) =>
            setCode(
              event.target.value
                .toUpperCase(),
            )
          }
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="QUFO-T1-XXXXXX-XXXXXX"
          className="qufo-input min-w-0 flex-1 font-mono text-sm uppercase"
        />

        <button
          type="submit"
          disabled={
            redeeming ||
            code.trim().length <
              8
          }
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redeeming ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <KeyRound
              size={16}
            />
          )}

          {redeeming
            ? "Activating..."
            : "Redeem code"}
        </button>
      </form>

      {success && (
        <div className="mt-3 text-xs text-emerald-300">
          {success}
        </div>
      )}
    </section>
  );
}

function Entitlement({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-400/10 bg-slate-950/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-200">
        {value}
      </div>

      {detail && (
        <div className="mt-1 text-[11px] text-slate-500">
          {detail}
        </div>
      )}
    </div>
  );
}

function formatBytes(
  bytes: number,
) {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index =
    Math.min(
      Math.floor(
        Math.log(bytes) /
          Math.log(1024),
      ),

      units.length - 1,
    );

  const value =
    bytes /
    1024 ** index;

  const formatted =
    index === 0 ||
    value >= 10
      ? Math.round(
          value,
        ).toLocaleString()
      : value.toFixed(1);

  return `${formatted} ${units[index]}`;
}