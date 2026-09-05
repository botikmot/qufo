'use client';

import {
  Building2,
  CreditCard,
  Headphones,
  UserRound,
  Users,
} from 'lucide-react';

import { useSearchParams } from 'next/navigation';

import { BusinessSettingsTab } from '@/components/settings/business-settings-tab';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { ProfilePhotoCard } from '@/components/settings/profile-photo-card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { SettingsTabTrigger } from '@/components/settings/settings-tab-trigger';
import { SubscriptionSettingsTab } from '@/components/settings/subscription-settings-tab';
import { SupportForm } from '@/components/settings/support-form';
import { TeamSettingsTab } from '@/components/settings/team-settings-tab';

import {
  Tabs,
  TabsContent,
  TabsList,
} from '@/components/ui/tabs';

import { useProfileSettings } from '@/hooks/use-profile-settings';

import { useAuthSession } from '@/lib/auth-storage';

const SUBSCRIPTION_ENABLED =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== 'false';

export default function SettingsPage() {
  const session = useAuthSession();

  const profile = useProfileSettings();

  const searchParams = useSearchParams();

  const role = session?.organization.role;

  const canManageBusiness = role === 'OWNER' || role === 'ADMIN';

  const canManageTeam = role === 'OWNER' || role === 'ADMIN';

  const canManageSubscription =
    SUBSCRIPTION_ENABLED && role === 'OWNER';

  const requestedTab = searchParams.get('tab');

  const defaultTab =
    requestedTab === 'business' && canManageBusiness
      ? 'business'
      : requestedTab === 'team' && canManageTeam
        ? 'team'
        : requestedTab === 'subscription' && canManageSubscription
          ? 'subscription'
          : requestedTab === 'support'
            ? 'support'
            : requestedTab === 'profile'
              ? 'profile'
              : canManageBusiness
                ? 'business'
                : 'profile';

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
          Manage your account and available workspace settings.
        </p>
      </div>

      <Tabs
        key={`${session?.organization.id ?? 'loading'}:${defaultTab}`}
        defaultValue={defaultTab}
        className="w-full"
      >
        <TabsList
          className="
            qufo-surface
            mb-6
            !grid
            !h-auto
            !w-full
            grid-cols-2
            items-stretch
            gap-1.5
            rounded-2xl
            p-1.5

            md:!inline-flex
            md:!w-auto
          "
        >
          {canManageBusiness && (
            <SettingsTabTrigger value="business" icon={<Building2 size={16} />}>
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

        {canManageBusiness && (
          <TabsContent value="business">
            <BusinessSettingsTab />
          </TabsContent>
        )}

        <TabsContent value="profile">
          {profile.loading ? (
            <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
              Loading profile...
            </div>
          ) : profile.profile ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <ProfilePhotoCard profile={profile.profile} />

                <ProfileSettingsForm
                  key={profile.profile.updatedAt}
                  profile={profile.profile}
                  saving={profile.saving}
                  error={profile.error}
                  success={profile.success}
                  onSave={profile.update}
                />
              </div>

              <ChangePasswordForm
                hasPassword={profile.profile.security.hasPassword}
                googleLinked={profile.profile.security.googleLinked}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
              {profile.error ?? 'Unable to load profile.'}
            </div>
          )}
        </TabsContent>

        {canManageTeam && (
          <TabsContent value="team">
            <TeamSettingsTab />
          </TabsContent>
        )}

        {canManageSubscription && (
          <TabsContent value="subscription">
            <SubscriptionSettingsTab />
          </TabsContent>
        )}

        <TabsContent value="support">
          <SupportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
