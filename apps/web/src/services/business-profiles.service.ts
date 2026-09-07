import {
  apiFetch,
} from "@/lib/api";

import type {
  BusinessProfile,
  BusinessProfilesResponse,
  CreateBusinessProfileData,
  UpdateBusinessProfileData,
} from "@/types/business-profile";

export const businessProfilesService = {
  getAll() {
    return apiFetch<BusinessProfilesResponse>(
      "/business-profiles",
    );
  },

  create(
    data: CreateBusinessProfileData,
  ) {
    return apiFetch<BusinessProfile>(
      "/business-profiles",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  update(
    id: string,
    data: UpdateBusinessProfileData,
  ) {
    return apiFetch<BusinessProfile>(
      `/business-profiles/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },

  setDefault(
    id: string,
  ) {
    return apiFetch<BusinessProfile>(
      `/business-profiles/${encodeURIComponent(
        id,
      )}/default`,
      {
        method: "PATCH",
      },
    );
  },

  useMainBusinessAsDefault() {
    return apiFetch<{
      success: boolean;
    }>(
      "/business-profiles/main/default",
      {
        method: "PATCH",
      },
    );
  },

  archive(
    id: string,
  ) {
    return apiFetch<{
      archived: boolean;
    }>(
      `/business-profiles/${encodeURIComponent(
        id,
      )}`,
      {
        method: "DELETE",
      },
    );
  },

  uploadLogo(
    id: string,
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    return apiFetch<BusinessProfile>(
      `/business-profiles/${encodeURIComponent(
        id,
      )}/logo`,
      {
        method: "POST",
        body: formData,
      },
    );
  },

  removeLogo(
    id: string,
  ) {
    return apiFetch<BusinessProfile>(
      `/business-profiles/${encodeURIComponent(
        id,
      )}/logo`,
      {
        method: "DELETE",
      },
    );
  },
};