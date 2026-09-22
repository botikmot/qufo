"use client";

import {
  Building2,
  CreditCard,
  Headphones,
  Settings2,
  UserRound,
  Users,
} from "lucide-react";

import { useSearchParams } from "next/navigation";

import { BusinessSettingsTab } from "@/components/settings/business-settings-tab";

import { ChangePasswordForm } from "@/components/settings/change-password-form";

import { ProfilePhotoCard } from "@/components/settings/profile-photo-card";

import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

import { SettingsTabTrigger } from "@/components/settings/settings-tab-trigger";

import { SubscriptionSettingsTab } from "@/components/settings/subscription-settings-tab";

import { SupportForm } from "@/components/settings/support-form";

import { TeamSettingsTab } from "@/components/settings/team-settings-tab";

import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";

import { useProfileSettings } from "@/hooks/use-profile-settings";

import { useAuthSession } from "@/lib/auth-storage";

const SUBSCRIPTION_ENABLED =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== "false";

export default function SettingsPage() {
  const session = useAuthSession();

  const profile = useProfileSettings();

  const searchParams = useSearchParams();

  const role = session?.organization.role;

  const canManageBusiness = role === "OWNER" || role === "ADMIN";

  const canManageTeam = role === "OWNER" || role === "ADMIN";

  const canManageSubscription = SUBSCRIPTION_ENABLED && role === "OWNER";

  const requestedTab = searchParams.get("tab");

  const defaultTab =
    requestedTab === "business" && canManageBusiness
      ? "business"
      : requestedTab === "team" && canManageTeam
        ? "team"
        : requestedTab === "subscription" && canManageSubscription
          ? "subscription"
          : requestedTab === "support"
            ? "support"
            : requestedTab === "profile"
              ? "profile"
              : canManageBusiness
                ? "business"
                : "profile";

  return (
    <div className="min-w-0 space-y-6 pb-6">
      {/* =========================================================
          SETTINGS HERO
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

        {/* Decorative wave */}

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-25"
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
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-4 p-6 sm:p-7">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
            <Settings2 size={22} strokeWidth={1.7} />
          </div>

          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/70">
              Workspace
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage your account and available workspace settings.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          SETTINGS TABS
      ========================================================= */}

      <Tabs
        key={`${session?.organization.id ?? "loading"}:${defaultTab}`}
        defaultValue={defaultTab}
        className="w-full min-w-0"
      >
        <div className="overflow-x-auto">
          <TabsList
            className="
              qufo-surface
              !flex
              !h-auto
              !w-full
              items-stretch
              gap-1.5
              rounded-2xl
              border
              border-[var(--qufo-border)]
              p-1.5
              overflow-x-auto

              [&_[role=tab]]:h-12
              [&_[role=tab]]:min-h-12

              lg:grid
              lg:grid-flow-col
              lg:auto-cols-fr
            "
            style={{
              gridTemplateColumns: `repeat(${
                [
                  canManageBusiness,
                  true,
                  canManageTeam,
                  canManageSubscription,
                  true,
                ].filter(Boolean).length
              }, minmax(0, 1fr))`,
            }}
          >
            {canManageBusiness && (
              <SettingsTabTrigger
                value="business"
                icon={<Building2 size={16} />}
              >
                Business
              </SettingsTabTrigger>
            )}

            <SettingsTabTrigger value="profile" icon={<UserRound size={16} />}>
              My Profile
            </SettingsTabTrigger>

            {canManageTeam && (
              <SettingsTabTrigger value="team" icon={<Users size={16} />}>
                Team
              </SettingsTabTrigger>
            )}

            {canManageSubscription && (
              <SettingsTabTrigger
                value="subscription"
                icon={<CreditCard size={16} />}
              >
                Subscription
              </SettingsTabTrigger>
            )}

            <SettingsTabTrigger value="support" icon={<Headphones size={16} />}>
              Support
            </SettingsTabTrigger>
          </TabsList>
        </div>

        {/* =======================================================
            BUSINESS
        ======================================================= */}

        {canManageBusiness && (
          <TabsContent value="business" className="mt-5 min-w-0">
            <BusinessSettingsTab />
          </TabsContent>
        )}

        {/* =======================================================
            PROFILE
        ======================================================= */}

        <TabsContent value="profile" className="mt-5 min-w-0">
          {profile.loading ? (
            <div className="qufo-surface flex min-h-64 items-center justify-center rounded-2xl border border-[var(--qufo-border)] px-6 text-sm text-slate-500">
              Loading profile...
            </div>
          ) : profile.profile ? (
            <div className="grid min-w-0 gap-5 xl:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)]">
              {/* =====================================================
                  PROFILE PHOTO
              ===================================================== */}

              <div className="min-w-0">
                <ProfilePhotoCard profile={profile.profile} />
              </div>

              {/* =====================================================
                  MY PROFILE
              ===================================================== */}

              <div className="min-w-0">
                <ProfileSettingsForm
                  key={profile.profile.updatedAt}
                  profile={profile.profile}
                  saving={profile.saving}
                  error={profile.error}
                  success={profile.success}
                  onSave={profile.update}
                />
              </div>

              {/* =====================================================
                  SECURITY
              ===================================================== */}

              <div className="min-w-0">
                <ChangePasswordForm
                  hasPassword={profile.profile.security.hasPassword}
                  googleLinked={profile.profile.security.googleLinked}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
              {profile.error ?? "Unable to load profile."}
            </div>
          )}
        </TabsContent>

        {/* =======================================================
            TEAM
        ======================================================= */}

        {canManageTeam && (
          <TabsContent value="team" className="mt-5 min-w-0">
            <TeamSettingsTab />
          </TabsContent>
        )}

        {/* =======================================================
            SUBSCRIPTION
        ======================================================= */}

        {canManageSubscription && (
          <TabsContent value="subscription" className="mt-5 min-w-0">
            <SubscriptionSettingsTab />
          </TabsContent>
        )}

        {/* =======================================================
            SUPPORT
        ======================================================= */}

        <TabsContent value="support" className="mt-5 min-w-0">
          <SupportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
