"use client";

import {
  Building2,
  CreditCard,
  UserRound,
  Headphones,
} from "lucide-react";

import {
  BusinessSettingsForm,
} from "@/components/settings/business-settings-form";

import {
  ProfileSettingsForm,
} from "@/components/settings/profile-settings-form";

import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { ProfilePhotoCard } from "@/components/settings/profile-photo-card";

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

import {
  SupportForm,
} from "@/components/settings/support-form";

import {
  useSearchParams,
} from "next/navigation";

const SUBSCRIPTION_ENABLED = process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== "false";

export default function SettingsPage() {
  const business =
    useBusinessSettings();

  const profile =
    useProfileSettings();

  const subscription =
    useSubscriptionSettings();

  const searchParams =
    useSearchParams();

  const requestedTab =
    searchParams.get(
      "tab",
    );

  const defaultTab =
    requestedTab ===
      "subscription"
      ? "subscription"
      : requestedTab ===
          "profile"
        ? "profile"
        : requestedTab ===
            "support"
          ? "support"
          : "business";

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
          <TabsTrigger
            value="business"
            className="
              !h-auto
              !w-full
              min-w-0
              justify-center
              gap-2
              rounded-xl
              px-3
              py-2.5
              text-slate-400
              data-[state=active]:bg-emerald-400/10
              data-[state=active]:text-emerald-300

              md:!w-auto
            "
          >
            <Building2
              size={16}
              className="shrink-0"
            />

            <span className="truncate">
              Business
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="profile"
            className="
              !h-auto
              !w-full
              min-w-0
              justify-center
              gap-2
              rounded-xl
              px-3
              py-2.5
              text-slate-400
              data-[state=active]:bg-emerald-400/10
              data-[state=active]:text-emerald-300

              md:!w-auto
            "
          >
            <UserRound
              size={16}
              className="shrink-0"
            />

            <span className="truncate">
              My Profile
            </span>
          </TabsTrigger>

          {SUBSCRIPTION_ENABLED && (
            <TabsTrigger
              value="subscription"
              className="
                !h-auto
                !w-full
                min-w-0
                justify-center
                gap-2
                rounded-xl
                px-3
                py-2.5
                text-slate-400
                data-[state=active]:bg-emerald-400/10
                data-[state=active]:text-emerald-300

                md:!w-auto
              "
            >
              <CreditCard
                size={16}
                className="shrink-0"
              />

              <span className="truncate">
                Subscription
              </span>
            </TabsTrigger>
          )}

          <TabsTrigger
            value="support"
            className="
              !h-auto
              !w-full
              min-w-0
              justify-center
              gap-2
              rounded-xl
              px-3
              py-2.5
              text-slate-400
              data-[state=active]:bg-emerald-400/10
              data-[state=active]:text-emerald-300

              md:!w-auto
            "
          >
            <Headphones
              size={16}
              className="shrink-0"
            />

            <span className="truncate">
              Support
            </span>
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
              uploadingLogo={
                business.uploadingLogo
              }
              removingLogo={
                business.removingLogo
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
              onUploadLogo={
                business.uploadLogo
              }
              onRemoveLogo={
                business.removeLogo
              }

              uploadingSignature={
                business.uploadingSignature
              }

              removingSignature={
                business.removingSignature
              }

              savingSignature={
                business.savingSignature
              }

              onUploadSignature={
                business.uploadSignature
              }

              onRemoveSignature={
                business.removeSignature
              }

              onSaveSignature={
                business.updateSignature
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
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <ProfilePhotoCard
                  profile={profile.profile}
                />

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
              </div>

              {profile.profile && (
                <ChangePasswordForm
                  hasPassword={
                    profile.profile.security
                      .hasPassword
                  }
                  googleLinked={
                    profile.profile.security
                      .googleLinked
                  }
                />
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
              {profile.error ??
                "Unable to load profile."}
            </div>
          )}
        </TabsContent>

        {SUBSCRIPTION_ENABLED && (
          <TabsContent value="subscription">
            {subscription.loading ? (
              <div className="qufo-surface rounded-3xl p-8 text-sm text-slate-500">
                Loading subscription...
              </div>
            ) : subscription.billing ? (
              <SubscriptionSettingsCard
                billing={
                  subscription.billing
                }
                payments={
                  subscription.payments
                }
                renewing={
                  subscription.renewing
                }
                confirmingPayment={
                  subscription.confirmingPayment
                }
                paymentResult={
                  subscription.paymentResult
                }
                error={
                  subscription.error
                }
                onRenew={
                  subscription.renew
                }
                onRefresh={
                  subscription.refresh
                }
              />
            ) : (
              <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5 text-sm text-red-300">
                {subscription.error ??
                  "Unable to load subscription."}
              </div>
            )}
          </TabsContent>
        )}
        
        <TabsContent value="support">
          <SupportForm />
        </TabsContent>

      </Tabs>
    </div>
  );
}