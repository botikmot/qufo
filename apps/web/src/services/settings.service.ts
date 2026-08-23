import {
  apiFetch,
} from "@/lib/api";

import type {
  BusinessSettings,
  ProfileSettings,
  SubscriptionSettings,
  UpdateBusinessSettingsData,
  UpdateBusinessSettingsResponse,
  UpdateProfileSettingsData,
  UpdateProfileSettingsResponse,
} from "@/types/settings";

export const settingsService = {
  getBusiness() {
    return apiFetch<BusinessSettings>(
      "/settings/business",
    );
  },

  updateBusiness(
    data: UpdateBusinessSettingsData,
  ) {
    return apiFetch<UpdateBusinessSettingsResponse>(
      "/settings/business",
      {
        method: "PATCH",

        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  getProfile() {
    return apiFetch<ProfileSettings>(
      "/settings/profile",
    );
  },

  updateProfile(
    data: UpdateProfileSettingsData,
  ) {
    return apiFetch<UpdateProfileSettingsResponse>(
      "/settings/profile",
      {
        method: "PATCH",

        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  getSubscription() {
    return apiFetch<SubscriptionSettings>(
      "/settings/subscription",
    );
  },

};