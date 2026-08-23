"use client";

import {
  Building2,
  CreditCard,
  UserRound,
} from "lucide-react";

import {
  BusinessSettingsForm,
} from "@/components/settings/business-settings-form";

import {
  ProfileSettingsForm,
} from "@/components/settings/profile-settings-form";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  useBusinessSettings,
} from "@/hooks/use-business-settings";

import {
  useProfileSettings,
} from "@/hooks/use-profile-settings";

import {
  SubscriptionSettingsCard,
} from "@/components/settings/subscription-settings-card";

import {
  useSubscriptionSettings,
} from "@/hooks/use-subscription-settings";

export default function SettingsPage() {
  const business =
    useBusinessSettings();

  const profile =
    useProfileSettings();

  const subscription =
    useSubscriptionSettings();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
          Workspace
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your business,
          account, and QUFO workspace.
        </p>
      </div>

      <Tabs
        defaultValue="business"
        className="w-full"
      >
        <TabsList className="qufo-surface mb-6 h-auto w-full justify-start gap-1 rounded-2xl p-1.5 sm:w-auto">
          <TabsTrigger
            value="business"
            className="gap-2 rounded-xl px-4 py-2.5 text-slate-400 data-[state=active]:bg-emerald-400/10 data-[state=active]:text-emerald-300"
          >
            <Building2 size={16} />

            Business
          </TabsTrigger>

          <TabsTrigger
            value="profile"
            className="gap-2 rounded-xl px-4 py-2.5 text-slate-400 data-[state=active]:bg-emerald-400/10 data-[state=active]:text-emerald-300"
          >
            <UserRound size={16} />

            My Profile
          </TabsTrigger>

          <TabsTrigger
            value="subscription"
            className="gap-2 rounded-xl px-4 py-2.5 text-slate-400 data-[state=active]:bg-emerald-400/10 data-[state=active]:text-emerald-300"
          >
            <CreditCard size={16} />

            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          {business.loading ? (
            <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
              Loading business settings...
            </div>
          ) : business.settings ? (
            <BusinessSettingsForm
              key={
                business.settings
                  .updatedAt
              }
              settings={
                business.settings
              }
              saving={
                business.saving
              }
              error={
                business.error
              }
              success={
                business.success
              }
              onSave={
                business.update
              }
            />
          ) : (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
              {business.error ??
                "Unable to load business settings."}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          {profile.loading ? (
            <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
              Loading profile...
            </div>
          ) : profile.profile ? (
            <ProfileSettingsForm
              key={
                profile.profile
                  .updatedAt
              }
              profile={
                profile.profile
              }
              saving={
                profile.saving
              }
              error={
                profile.error
              }
              success={
                profile.success
              }
              onSave={
                profile.update
              }
            />
          ) : (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
              {profile.error ??
                "Unable to load profile."}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscription">
          {subscription.loading ? (
            <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
              Loading subscription...
            </div>
          ) : subscription.subscription ? (
            <SubscriptionSettingsCard
              subscription={
                subscription.subscription
              }
            />
          ) : (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
              {subscription.error ??
                "Unable to load subscription."}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}