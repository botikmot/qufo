import {
  apiFetch,
} from "@/lib/api";

import type {
  BusinessSettings,
  ProfileSettings,
  SubscriptionSettings,
  UpdateBusinessSettingsData,
  UpdateProfileSettingsData,
  UpdateProfileSettingsResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  UploadProfilePhotoResponse,
  RemoveProfilePhotoResponse
} from "@/types/settings";

export const settingsService = {
  getBusiness() {
    return apiFetch<BusinessSettings>(
      "/organizations/current",
    );
  },

  updateBusiness(
    data: UpdateBusinessSettingsData,
  ) {
    return apiFetch<BusinessSettings>(
      "/organizations/current",
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

  changePassword(
    data: ChangePasswordData,
  ) {
    return apiFetch<ChangePasswordResponse>(
      "/settings/password",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },

  uploadProfilePhoto(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    return apiFetch<UploadProfilePhotoResponse>(
      "/settings/profile/avatar",
      {
        method: "POST",

        body: formData,
      },
    );
  },

  removeProfilePhoto() {
    return apiFetch<RemoveProfilePhotoResponse>(
      "/settings/profile/avatar",
      {
        method: "DELETE",
      },
    );
  },

};